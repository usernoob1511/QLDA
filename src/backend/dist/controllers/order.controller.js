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
exports.updateOrderStatus = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const async_1 = require("../middleware/async");
const database_1 = require("../config/database");
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const orders = yield models_1.Order.findAll({
        where: { UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
        include: [
            {
                model: models_1.Product,
                as: 'products',
                through: { attributes: ['Quantity', 'Price'] },
            },
        ],
        order: [['createdAt', 'DESC']],
    });
    res.json({
        status: 'success',
        data: {
            orders,
        },
    });
}));
// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const order = yield models_1.Order.findOne({
        where: {
            OrderID: req.params.id,
            UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
        include: [
            {
                model: models_1.Product,
                as: 'products',
                through: { attributes: ['Quantity', 'Price'] },
            },
        ],
    });
    if (!order) {
        throw new AppError_1.AppError('Order not found', 404);
    }
    res.json({
        status: 'success',
        data: {
            order,
        },
    });
}));
// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
exports.createOrder = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { shippingDetails } = req.body;
    // Get cart items
    const cartItems = yield models_1.Cart.findAll({
        where: { UserID: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
        include: [{
                model: models_1.Product,
                as: 'product',
                attributes: ['ProductID', 'Name', 'Price', 'Stock']
            }]
    });
    if (cartItems.length === 0) {
        throw new AppError_1.AppError('Cart is empty', 400);
    }
    // Start transaction
    const transaction = yield database_1.sequelize.transaction();
    try {
        // Create order
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            throw new AppError_1.AppError('User not found', 401);
        }
        const order = yield models_1.Order.create({
            UserID: req.user.id,
            Status: 'Pending',
            ShippingAddress: shippingDetails.address,
            ShippingCity: shippingDetails.city,
            ShippingState: shippingDetails.state,
            ShippingZipCode: shippingDetails.zipCode,
            ShippingName: shippingDetails.fullName,
            ShippingEmail: shippingDetails.email,
            ShippingPhone: shippingDetails.phone,
            TotalAmount: cartItems.reduce((sum, item) => sum + item.product.Price * item.Quantity, 0),
        }, { transaction });
        // Add order items and update stock
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            // Check stock
            if (product.Stock < cartItem.Quantity) {
                throw new AppError_1.AppError(`${product.Name} is out of stock`, 400);
            }
            // Add to order items
            yield order.addProduct(product, {
                through: {
                    Quantity: cartItem.Quantity,
                    Price: product.Price,
                },
                transaction,
            });
            // Update stock
            yield product.update({
                Stock: product.Stock - cartItem.Quantity,
            }, { transaction });
        }
        // Clear cart
        yield models_1.Cart.destroy({
            where: { UserID: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id },
            transaction,
        });
        yield transaction.commit();
        // Get complete order with products
        const completeOrder = yield models_1.Order.findByPk(order.OrderID, {
            include: [
                {
                    model: models_1.Product,
                    as: 'products',
                    through: { attributes: ['Quantity', 'Price'] },
                },
            ],
        });
        res.status(201).json({
            status: 'success',
            data: {
                order: completeOrder,
            },
        });
    }
    catch (error) {
        yield transaction.rollback();
        throw error;
    }
}));
// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = (0, async_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const order = yield models_1.Order.findByPk(req.params.id);
    if (!order) {
        throw new AppError_1.AppError('Order not found', 404);
    }
    order.Status = status;
    yield order.save();
    res.json({
        status: 'success',
        data: {
            order,
        },
    });
}));
