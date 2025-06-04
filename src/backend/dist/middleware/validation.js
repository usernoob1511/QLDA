"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentRequest = void 0;
const AppError_1 = require("../utils/AppError");
// ... existing code ...
const validatePaymentRequest = (req, res, next) => {
    const { orderId, amount, orderInfo } = req.body;
    if (!orderId) {
        throw new AppError_1.AppError('Order ID is required', 400);
    }
    if (!amount || amount <= 0) {
        throw new AppError_1.AppError('Valid amount is required', 400);
    }
    if (!orderInfo) {
        throw new AppError_1.AppError('Order information is required', 400);
    }
    next();
};
exports.validatePaymentRequest = validatePaymentRequest;
