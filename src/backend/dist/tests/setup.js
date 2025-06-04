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
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDb = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Load environment variables
// Create test database connection
exports.testDb = new sequelize_1.Sequelize({
    dialect: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.TEST_DB_NAME || 'QLDA_TEST',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
});
// Global setup
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.testDb.authenticate();
        yield exports.testDb.sync({ force: true }); // Recreate all tables
    }
    catch (error) {
        console.error('Test database connection failed:', error);
        process.exit(1);
    }
}));
// Global teardown
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.testDb.close();
}));
