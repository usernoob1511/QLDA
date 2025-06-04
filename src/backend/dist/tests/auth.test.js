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
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('Auth API', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.destroy({ where: {} }); // Clear users table
    }));
    describe('POST /api/auth/register', () => {
        const validUser = {
            Email: 'test@example.com',
            Password: 'Password123!',
            Name: 'Test User',
            Role: 'customer',
        };
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(validUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.data.user.Email).toBe(validUser.Email);
            expect(response.body.data.user).not.toHaveProperty('Password');
        }));
        it('should not register user with existing email', () => __awaiter(void 0, void 0, void 0, function* () {
            yield User_1.default.create(Object.assign(Object.assign({}, validUser), { Password: yield bcryptjs_1.default.hash(validUser.Password, 10) }));
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(validUser);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
        it('should validate password requirements', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(Object.assign(Object.assign({}, validUser), { Password: 'weak' }));
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/password/i);
        }));
    });
    describe('POST /api/auth/login', () => {
        const testUser = {
            Email: 'test@example.com',
            Password: 'Password123!',
            Name: 'Test User',
            Role: 'customer',
        };
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield User_1.default.create(Object.assign(Object.assign({}, testUser), { Password: yield bcryptjs_1.default.hash(testUser.Password, 10) }));
        }));
        it('should login successfully with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                Email: testUser.Email,
                Password: testUser.Password,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.data.user.Email).toBe(testUser.Email);
        }));
        it('should not login with incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                Email: testUser.Email,
                Password: 'wrongpassword',
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        }));
        it('should not login with non-existent email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                Email: 'nonexistent@example.com',
                Password: testUser.Password,
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /api/auth/me', () => {
        let token;
        const testUser = {
            Email: 'test@example.com',
            Password: 'Password123!',
            Name: 'Test User',
            Role: 'customer',
        };
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.default.create(Object.assign(Object.assign({}, testUser), { Password: yield bcryptjs_1.default.hash(testUser.Password, 10) }));
            token = jsonwebtoken_1.default.sign({ id: user.UserID }, process.env.JWT_SECRET || 'secret');
        }));
        it('should get current user profile', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.data.user.Email).toBe(testUser.Email);
            expect(response.body.data.user).not.toHaveProperty('Password');
        }));
        it('should not allow access without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default).get('/api/auth/me');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        }));
        it('should not allow access with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
});
