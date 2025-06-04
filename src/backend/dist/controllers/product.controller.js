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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const async_1 = require("../middleware/async");
const sequelize_1 = require("sequelize");
// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const category = req.query.category;
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    // Build where clause
    const whereClause = {};
    if (search) {
        whereClause.Name = { [sequelize_1.Op.like]: `%${search}%` };
    }
    if (category) {
        whereClause.CategoryID = category;
    }
    if (!isNaN(minPrice)) {
        whereClause.Price = Object.assign(Object.assign({}, whereClause.Price), { [sequelize_1.Op.gte]: minPrice });
    }
    if (!isNaN(maxPrice)) {
        whereClause.Price = Object.assign(Object.assign({}, whereClause.Price), { [sequelize_1.Op.lte]: maxPrice });
    }
    const { count, rows: products } = yield models_1.Product.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: models_1.Category,
                as: 'category',
                attributes: ['CategoryID', 'Name'],
            },
        ],
        limit,
        offset: (page - 1) * limit,
    });
    res.json({
        status: 'success',
        data: {
            products,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
            },
        },
    });
}));
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield models_1.Product.findByPk(req.params.id, {
        include: [
            {
                model: models_1.Category,
                as: 'category',
                attributes: ['CategoryID', 'Name'],
            },
        ],
    });
    if (!product) {
        throw new AppError_1.AppError('Product not found', 404);
    }
    res.json({
        status: 'success',
        data: {
            product,
        },
    });
}));
// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    // Check if category exists
    const category = yield models_1.Category.findByPk(categoryId);
    if (!category) {
        throw new AppError_1.AppError('Category not found', 404);
    }
    const product = yield models_1.Product.create({
        Name: name,
        Description: description,
        Price: price,
        Stock: stock,
        CategoryID: categoryId,
        ImageURL: imageUrl,
    });
    res.status(201).json({
        status: 'success',
        data: {
            product,
        },
    });
}));
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    const product = yield models_1.Product.findByPk(req.params.id);
    if (!product) {
        throw new AppError_1.AppError('Product not found', 404);
    }
    if (categoryId) {
        // Check if category exists
        const category = yield models_1.Category.findByPk(categoryId);
        if (!category) {
            throw new AppError_1.AppError('Category not found', 404);
        }
        product.CategoryID = categoryId;
    }
    if (name)
        product.Name = name;
    if (description)
        product.Description = description;
    if (price)
        product.Price = price;
    if (stock !== undefined)
        product.Stock = stock;
    if (imageUrl)
        product.ImageURL = imageUrl;
    yield product.save();
    res.json({
        status: 'success',
        data: {
            product,
        },
    });
}));
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield models_1.Product.findByPk(req.params.id);
    if (!product) {
        throw new AppError_1.AppError('Product not found', 404);
    }
    yield product.destroy();
    res.json({
        status: 'success',
        data: null,
    });
}));
