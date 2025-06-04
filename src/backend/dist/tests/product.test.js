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
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('Product API', () => {
    let adminToken;
    let userToken;
    let testCategory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create test users
        const admin = yield User_1.default.create({
            Email: 'admin@example.com',
            Password: 'Password123!',
            Name: 'Admin User',
            Role: 'admin',
        });
        const user = yield User_1.default.create({
            Email: 'user@example.com',
            Password: 'Password123!',
            Name: 'Regular User',
            Role: 'customer',
        });
        adminToken = jsonwebtoken_1.default.sign({ id: admin.UserID }, process.env.JWT_SECRET || 'secret');
        userToken = jsonwebtoken_1.default.sign({ id: user.UserID }, process.env.JWT_SECRET || 'secret');
        // Create test category
        testCategory = yield Category_1.default.create({
            Name: 'Test Category',
            Description: 'Test Category Description',
        });
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Product_1.default.destroy({ where: {} }); // Clear products table
    }));
    describe('GET /api/products', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create test products
            yield Product_1.default.bulkCreate([
                {
                    Name: 'Test Product 1',
                    Description: 'Description 1',
                    Price: 99.99,
                    Stock: 10,
                    CategoryID: testCategory.CategoryID,
                },
                {
                    Name: 'Test Product 2',
                    Description: 'Description 2',
                    Price: 149.99,
                    Stock: 5,
                    CategoryID: testCategory.CategoryID,
                },
            ]);
        }));
        it('should get all products', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default).get('/api/products');
            expect(response.status).toBe(200);
            expect(response.body.data.products).toHaveLength(2);
            expect(response.body.data.products[0]).toHaveProperty('Name');
            expect(response.body.data.products[0]).toHaveProperty('Price');
        }));
        it('should filter products by category', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/products')
                .query({ category: testCategory.CategoryID });
            expect(response.status).toBe(200);
            expect(response.body.data.products).toHaveLength(2);
            expect(response.body.data.products[0].CategoryID).toBe(testCategory.CategoryID);
        }));
        it('should paginate products', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/products')
                .query({ page: 1, limit: 1 });
            expect(response.status).toBe(200);
            expect(response.body.data.products).toHaveLength(1);
            expect(response.body.data).toHaveProperty('pagination');
            expect(response.body.data.pagination.total).toBe(2);
        }));
    });
    describe('POST /api/products', () => {
        const newProduct = {
            Name: 'New Product',
            Description: 'New Product Description',
            Price: 199.99,
            Stock: 15,
            CategoryID: 1,
        };
        it('should create product when admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newProduct);
            expect(response.status).toBe(201);
            expect(response.body.data.product.Name).toBe(newProduct.Name);
            expect(response.body.data.product.Price).toBe(newProduct.Price);
        }));
        it('should not create product when not admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newProduct);
            expect(response.status).toBe(403);
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                Name: 'Test Product',
                // Missing required fields
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('PUT /api/products/:id', () => {
        let testProduct;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testProduct = yield Product_1.default.create({
                Name: 'Test Product',
                Description: 'Test Description',
                Price: 99.99,
                Stock: 10,
                CategoryID: testCategory.CategoryID,
            });
        }));
        it('should update product when admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/products/${testProduct.ProductID}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                Name: 'Updated Product',
                Price: 149.99,
            });
            expect(response.status).toBe(200);
            expect(response.body.data.product.Name).toBe('Updated Product');
            expect(response.body.data.product.Price).toBe(149.99);
        }));
        it('should not update product when not admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/products/${testProduct.ProductID}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                Name: 'Updated Product',
            });
            expect(response.status).toBe(403);
        }));
        it('should return 404 for non-existent product', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .put('/api/products/999999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                Name: 'Updated Product',
            });
            expect(response.status).toBe(404);
        }));
    });
    describe('DELETE /api/products/:id', () => {
        let testProduct;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testProduct = yield Product_1.default.create({
                Name: 'Test Product',
                Description: 'Test Description',
                Price: 99.99,
                Stock: 10,
                CategoryID: testCategory.CategoryID,
            });
        }));
        it('should delete product when admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/products/${testProduct.ProductID}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            const deletedProduct = yield Product_1.default.findByPk(testProduct.ProductID);
            expect(deletedProduct).toBeNull();
        }));
        it('should not delete product when not admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/products/${testProduct.ProductID}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            const product = yield Product_1.default.findByPk(testProduct.ProductID);
            expect(product).not.toBeNull();
        }));
        it('should return 404 for non-existent product', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete('/api/products/999999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        }));
    });
});
