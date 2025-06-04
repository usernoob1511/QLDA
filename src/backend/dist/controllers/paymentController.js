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
exports.handleVNPayIPN = exports.handleVNPayReturn = exports.createVNPayPayment = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qs_1 = __importDefault(require("qs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const vnpayConfig = {
    tmnCode: process.env.VNP_TMN_CODE || '',
    hashSecret: process.env.VNP_HASH_SECRET || '',
    url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay/return',
};
const createVNPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, orderDescription } = req.body;
        const date = new Date();
        const createDate = date.toISOString().split('T')[0].split('-').join('') + date.toTimeString().split(' ')[0].split(':').join('');
        const orderId = date.getTime();
        const currCode = 'VND';
        const vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnpayConfig.tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: currCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderDescription,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: vnpayConfig.returnUrl,
            vnp_CreateDate: createDate,
            vnp_IpAddr: req.ip
        };
        const signData = qs_1.default.stringify(vnpParams);
        const hmac = crypto_1.default.createHmac('sha512', vnpayConfig.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnpParams['vnp_SecureHash'] = signed;
        const vnpUrl = vnpayConfig.url + '?' + qs_1.default.stringify(vnpParams);
        res.json({ url: vnpUrl });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create payment URL' });
    }
});
exports.createVNPayPayment = createVNPayPayment;
const handleVNPayReturn = (req, res) => {
    try {
        const vnpParams = req.query;
        const secureHash = vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;
        const signData = qs_1.default.stringify(vnpParams);
        const hmac = crypto_1.default.createHmac('sha512', vnpayConfig.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        if (secureHash === signed) {
            const responseCode = vnpParams.vnp_ResponseCode;
            if (responseCode === '00') {
                res.json({ status: 'success', message: 'Payment successful' });
            }
            else {
                res.json({ status: 'error', message: 'Payment failed' });
            }
        }
        else {
            res.status(400).json({ status: 'error', message: 'Invalid signature' });
        }
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
exports.handleVNPayReturn = handleVNPayReturn;
const handleVNPayIPN = (req, res) => {
    try {
        const vnpParams = req.query;
        const secureHash = vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;
        const signData = qs_1.default.stringify(vnpParams);
        const hmac = crypto_1.default.createHmac('sha512', vnpayConfig.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        if (secureHash === signed) {
            const responseCode = vnpParams.vnp_ResponseCode;
            if (responseCode === '00') {
                // Update order status in database here
                res.status(200).json({ RspCode: '00', Message: 'Success' });
            }
            else {
                res.status(200).json({ RspCode: '99', Message: 'Payment failed' });
            }
        }
        else {
            res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }
    }
    catch (error) {
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};
exports.handleVNPayIPN = handleVNPayIPN;
