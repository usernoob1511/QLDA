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
exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const async_1 = require("../middleware/async");
// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cart = yield models_1.Cart.findAll({
        where: { UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
        include: [
            {
                model: models_1.Product,
                as: 'product',
                attributes: ['ProductID', 'Name', 'Price', 'Description', 'ImageURL'],
            },
        ],
    });
    res.json({
        status: 'success',
        data: {
            cart,
        },
    });
}));
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { productId, quantity } = req.body;
    // Check if product exists
    const product = yield models_1.Product.findByPk(productId);
    if (!product) {
        throw new AppError_1.AppError('Product not found', 404);
    }
    // Check if quantity is valid
    if (quantity <= 0) {
        throw new AppError_1.AppError('Quantity must be greater than 0', 400);
    }
    // Check if product is in stock
    if (product.Stock < quantity) {
        throw new AppError_1.AppError('Product is out of stock', 400);
    }
    // Check if item already exists in cart
    let cartItem = yield models_1.Cart.findOne({
        where: {
            UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            ProductID: productId,
        },
    });
    if (cartItem) {
        // Update quantity
        cartItem.Quantity += quantity;
        yield cartItem.save();
    }
    else {
        // Create new cart item
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            throw new AppError_1.AppError('User not found', 401);
        }
        cartItem = yield models_1.Cart.create({
            UserID: req.user.id,
            ProductID: productId,
            Quantity: quantity,
        });
    }
    // Get updated cart item with product details
    const updatedCartItem = yield models_1.Cart.findByPk(cartItem.CartID, {
        include: [
            {
                model: models_1.Product,
                as: 'product',
                attributes: ['ProductID', 'Name', 'Price', 'Description', 'ImageURL'],
            },
        ],
    });
    res.status(201).json({
        status: 'success',
        data: {
            cartItem: updatedCartItem,
        },
    });
}));
// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { quantity } = req.body;
    // Check if quantity is valid
    if (quantity <= 0) {
        throw new AppError_1.AppError('Quantity must be greater than 0', 400);
    }
    const cartItem = yield models_1.Cart.findOne({
        where: {
            CartID: req.params.id,
            UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
        include: ['product'],
    });
    if (!cartItem) {
        throw new AppError_1.AppError('Cart item not found', 404);
    }
    // Check if product is in stock
    const product = yield models_1.Product.findByPk(cartItem.ProductID);
    if (!product || product.Stock < quantity) {
        throw new AppError_1.AppError('Product is out of stock', 400);
    }
    cartItem.Quantity = quantity;
    yield cartItem.save();
    res.json({
        status: 'success',
        data: {
            cartItem,
        },
    });
}));
// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cartItem = yield models_1.Cart.findOne({
        where: {
            CartID: req.params.id,
            UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
    });
    if (!cartItem) {
        throw new AppError_1.AppError('Cart item not found', 404);
    }
    yield cartItem.destroy();
    res.json({
        status: 'success',
        data: null,
    });
}));
