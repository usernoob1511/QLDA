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
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const async_1 = require("../middleware/async");
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    // Check if user exists
    const userExists = yield models_1.User.findOne({ where: { Email: email } });
    if (userExists) {
        throw new AppError_1.AppError('User already exists', 400);
    }
    // Create user
    const user = yield models_1.User.create({
        Email: email,
        Password: password,
        Name: name,
        Role: 'customer',
    });
    // Generate token
    const token = jsonwebtoken_1.default.sign({ id: user.UserID, role: user.Role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
    res.status(201).json({
        status: 'success',
        data: {
            user: {
                UserID: user.UserID,
                Email: user.Email,
                Name: user.Name,
                Role: user.Role,
            },
            token,
        },
    });
}));
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Check if user exists
    const user = yield models_1.User.findOne({ where: { Email: email } });
    if (!user) {
        throw new AppError_1.AppError('Invalid credentials', 401);
    }
    // Check password
    const isPasswordValid = yield user.comparePassword(password);
    if (!isPasswordValid) {
        throw new AppError_1.AppError('Invalid credentials', 401);
    }
    // Generate token
    const token = jsonwebtoken_1.default.sign({ id: user.UserID, role: user.Role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
    res.json({
        status: 'success',
        data: {
            user: {
                UserID: user.UserID,
                Email: user.Email,
                Name: user.Name,
                Role: user.Role,
            },
            token,
        },
    });
}));
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield models_1.User.findByPk((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, {
        attributes: { exclude: ['Password'] },
    });
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    res.json({
        status: 'success',
        data: {
            user,
        },
    });
}));
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, email, password } = req.body;
    const user = yield models_1.User.findByPk((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    // Update fields
    if (name)
        user.Name = name;
    if (email)
        user.Email = email;
    if (password)
        user.Password = password;
    yield user.save();
    res.json({
        status: 'success',
        data: {
            user: {
                UserID: user.UserID,
                Email: user.Email,
                Name: user.Name,
                Role: user.Role,
            },
        },
    });
}));
