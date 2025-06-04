"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Create VNPay payment URL and redirect
router.post('/vnpay/create', auth_1.authenticateToken, validation_1.validatePaymentRequest, paymentController_1.createVNPayPayment);
// Handle VNPay return URL
router.get('/vnpay/return', paymentController_1.handleVNPayReturn);
// Handle VNPay IPN (Instant Payment Notification)
router.get('/vnpay/ipn', paymentController_1.handleVNPayIPN);
exports.default = router;
