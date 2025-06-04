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
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const Cart_1 = __importDefault(require("../models/Cart"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('Order API', () => {
    let userToken;
    let adminToken;
    let testUser;
    let testProduct;
    let testOrder;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create test user
        testUser = yield User_1.default.create({
            Email: 'user@example.com',
            Password: 'Password123!',
            Name: 'Test User',
            Role: 'customer',
        });
        // Create admin user
        const admin = yield User_1.default.create({
            Email: 'admin@example.com',
            Password: 'Password123!',
            Name: 'Admin User',
            Role: 'admin',
        });
        userToken = jsonwebtoken_1.default.sign({ id: testUser.UserID }, process.env.JWT_SECRET || 'secret');
        adminToken = jsonwebtoken_1.default.sign({ id: admin.UserID }, process.env.JWT_SECRET || 'secret');
        // Create test product
        testProduct = yield Product_1.default.create({
            Name: 'Test Product',
            Description: 'Test Description',
            Price: 99.99,
            Stock: 10,
            CategoryID: 1,
        });
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Order_1.default.destroy({ where: {} }); // Clear orders table
        yield Cart_1.default.destroy({ where: {} }); // Clear cart table
    }));
    describe('POST /api/orders', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Add items to cart
            yield Cart_1.default.create({
                UserID: testUser.UserID,
                ProductID: testProduct.ProductID,
                Quantity: 2,
            });
        }));
        const orderData = {
            shippingDetails: {
                fullName: 'Test User',
                email: 'user@example.com',
                phone: '1234567890',
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
            },
        };
        it('should create order from cart items', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);
            expect(response.status).toBe(201);
            expect(response.body.data.order).toHaveProperty('OrderID');
            expect(response.body.data.order.TotalAmount).toBe(199.98); // 99.99 * 2
            expect(response.body.data.order.Status).toBe('Pending');
            // Check if cart is cleared
            const cartItems = yield Cart_1.default.findAll({ where: { UserID: testUser.UserID } });
            expect(cartItems).toHaveLength(0);
            // Check if product stock is updated
            const updatedProduct = yield Product_1.default.findByPk(testProduct.ProductID);
            expect(updatedProduct).not.toBeNull();
            expect(updatedProduct.Stock).toBe(8); // 10 - 2
        }));
        it('should validate shipping details', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                shippingDetails: {
                    fullName: 'Test User',
                    // Missing required fields
                },
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/shipping/i);
        }));
        it('should not create order with empty cart', () => __awaiter(void 0, void 0, void 0, function* () {
            yield Cart_1.default.destroy({ where: { UserID: testUser.UserID } });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/cart/i);
        }));
    });
    describe('GET /api/orders', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create test order
            testOrder = yield Order_1.default.create({
                UserID: testUser.UserID,
                TotalAmount: 199.98,
                Status: 'Pending',
                ShippingAddress: '123 Test St',
                ShippingCity: 'Test City',
                ShippingState: 'Test State',
                ShippingZipCode: '12345',
                ShippingName: 'Test User',
                ShippingEmail: 'user@example.com',
                ShippingPhone: '1234567890',
            });
            // Add order items
            yield testOrder.addProduct(testProduct, {
                through: {
                    Quantity: 2,
                    Price: 99.99,
                },
            });
        }));
        it('should get user orders', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/orders')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.orders).toHaveLength(1);
            expect(response.body.data.orders[0].OrderID).toBe(testOrder.OrderID);
            expect(response.body.data.orders[0].TotalAmount).toBe(199.98);
        }));
        it('should get all orders as admin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create another user's order
            const otherUser = yield User_1.default.create({
                Email: 'other@example.com',
                Password: 'Password123!',
                Name: 'Other User',
                Role: 'customer',
            });
            yield Order_1.default.create({
                UserID: otherUser.UserID,
                TotalAmount: 99.99,
                Status: 'Pending',
                ShippingAddress: '456 Test St',
                ShippingCity: 'Test City',
                ShippingState: 'Test State',
                ShippingZipCode: '12345',
                ShippingName: 'Other User',
                ShippingEmail: 'other@example.com',
                ShippingPhone: '0987654321',
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.orders).toHaveLength(2);
        }));
    });
    describe('GET /api/orders/:id', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create test order
            testOrder = yield Order_1.default.create({
                UserID: testUser.UserID,
                TotalAmount: 199.98,
                Status: 'Pending',
                ShippingAddress: '123 Test St',
                ShippingCity: 'Test City',
                ShippingState: 'Test State',
                ShippingZipCode: '12345',
                ShippingName: 'Test User',
                ShippingEmail: 'user@example.com',
                ShippingPhone: '1234567890',
            });
            yield testOrder.addProduct(testProduct, {
                through: {
                    Quantity: 2,
                    Price: 99.99,
                },
            });
        }));
        it('should get order details', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/orders/${testOrder.OrderID}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.order.OrderID).toBe(testOrder.OrderID);
            expect(response.body.data.order.products).toHaveLength(1);
            expect(response.body.data.order.products[0].ProductID).toBe(testProduct.ProductID);
        }));
        it('should not allow access to other user orders', () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield User_1.default.create({
                Email: 'other@example.com',
                Password: 'Password123!',
                Name: 'Other User',
                Role: 'customer',
            });
            const otherToken = jsonwebtoken_1.default.sign({ id: otherUser.UserID }, process.env.JWT_SECRET || 'secret');
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/orders/${testOrder.OrderID}`)
                .set('Authorization', `Bearer ${otherToken}`);
            expect(response.status).toBe(404);
        }));
        it('should allow admin to access any order', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/orders/${testOrder.OrderID}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.order.OrderID).toBe(testOrder.OrderID);
        }));
    });
    describe('PUT /api/orders/:id/status', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testOrder = yield Order_1.default.create({
                UserID: testUser.UserID,
                TotalAmount: 199.98,
                Status: 'Pending',
                ShippingAddress: '123 Test St',
                ShippingCity: 'Test City',
                ShippingState: 'Test State',
                ShippingZipCode: '12345',
                ShippingName: 'Test User',
                ShippingEmail: 'user@example.com',
                ShippingPhone: '1234567890',
            });
        }));
        it('should update order status as admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/orders/${testOrder.OrderID}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'processing' });
            expect(response.status).toBe(200);
            expect(response.body.data.order.Status).toBe('processing');
        }));
        it('should not allow status update as regular user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/orders/${testOrder.OrderID}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'processing' });
            expect(response.status).toBe(403);
        }));
        it('should validate status value', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/orders/${testOrder.OrderID}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalid_status' });
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/status/i);
        }));
    });
});
