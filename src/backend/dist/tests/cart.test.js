"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('Cart API', () => {
    let userToken;
    let testUser;
    let testProduct;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create test user
        testUser = yield User_1.default.create({
            Email: 'user@example.com',
            Password: 'Password123!',
            Name: 'Test User',
            Role: 'customer',
        });
        userToken = jsonwebtoken_1.default.sign({ id: testUser.UserID }, process.env.JWT_SECRET || 'secret');
        // Create test product
        testProduct = yield Product_1.default.create({
            Name: 'Test Product',
            Description: 'Test Description',
            Price: 99.99,
            Stock: 10,
            CategoryID: 1, // Default category ID for testing
        });
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Cart_1.default.destroy({ where: {} }); // Clear cart table
    }));
    describe('GET /api/cart', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield Cart_1.default.create({
                UserID: testUser.UserID,
                ProductID: testProduct.ProductID,
                Quantity: 2,
            });
        }));
        it('should get user cart items', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/cart')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.cart).toHaveLength(1);
            expect(response.body.data.cart[0].ProductID).toBe(testProduct.ProductID);
            expect(response.body.data.cart[0].Quantity).toBe(2);
        }));
        it('should not allow access without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default).get('/api/cart');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/cart', () => {
        it('should add item to cart', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                productId: testProduct.ProductID,
                quantity: 1,
            });
            expect(response.status).toBe(201);
            expect(response.body.data.cartItem.ProductID).toBe(testProduct.ProductID);
            expect(response.body.data.cartItem.Quantity).toBe(1);
        }));
        it('should update quantity if item already in cart', () => __awaiter(void 0, void 0, void 0, function* () {
            // Add initial item
            yield Cart_1.default.create({
                UserID: testUser.UserID,
                ProductID: testProduct.ProductID,
                Quantity: 1,
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                productId: testProduct.ProductID,
                quantity: 2,
            });
            expect(response.status).toBe(200);
            expect(response.body.data.cartItem.Quantity).toBe(3); // 1 + 2
        }));
        it('should validate stock availability', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                productId: testProduct.ProductID,
                quantity: 20, // More than available stock
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/stock/i);
        }));
    });
    describe('PUT /api/cart/:id', () => {
        let cartItem;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            cartItem = yield Cart_1.default.create({
                UserID: testUser.UserID,
                ProductID: testProduct.ProductID,
                Quantity: 1,
            });
        }));
        it('should update cart item quantity', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/cart/${cartItem.CartID}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                quantity: 3,
            });
            expect(response.status).toBe(200);
            expect(response.body.data.cartItem.Quantity).toBe(3);
        }));
        it('should validate stock availability on update', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/cart/${cartItem.CartID}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                quantity: 20, // More than available stock
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/stock/i);
        }));
        it('should not update other user cart items', () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield User_1.default.create({
                Email: 'other@example.com',
                Password: 'Password123!',
                Name: 'Other User',
                Role: 'customer',
            });
            const otherToken = jsonwebtoken_1.default.sign({ id: otherUser.UserID }, process.env.JWT_SECRET || 'secret');
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/cart/${cartItem.CartID}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                quantity: 3,
            });
            expect(response.status).toBe(404);
        }));
    });
    describe('DELETE /api/cart/:id', () => {
        let cartItem;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            cartItem = yield Cart_1.default.create({
                UserID: testUser.UserID,
                ProductID: testProduct.ProductID,
                Quantity: 1,
            });
        }));
        it('should remove item from cart', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/cart/${cartItem.CartID}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            const deletedItem = yield Cart_1.default.findByPk(cartItem.CartID);
            expect(deletedItem).toBeNull();
        }));
        it('should not delete other user cart items', () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield User_1.default.create({
                Email: 'other@example.com',
                Password: 'Password123!',
                Name: 'Other User',
                Role: 'customer',
            });
            const otherToken = jsonwebtoken_1.default.sign({ id: otherUser.UserID }, process.env.JWT_SECRET || 'secret');
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/cart/${cartItem.CartID}`)
                .set('Authorization', `Bearer ${otherToken}`);
            expect(response.status).toBe(404);
            const item = yield Cart_1.default.findByPk(cartItem.CartID);
            expect(item).not.toBeNull();
        }));
    });
});
