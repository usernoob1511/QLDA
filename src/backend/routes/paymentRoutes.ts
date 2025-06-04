import express from 'express';
import { createVNPayPayment, handleVNPayReturn, handleVNPayIPN } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';
import { validatePaymentRequest } from '../middleware/validation';

const router = express.Router();

// Create VNPay payment URL and redirect
router.post('/vnpay/create', authenticateToken, validatePaymentRequest, createVNPayPayment);

// Handle VNPay return URL
router.get('/vnpay/return', handleVNPayReturn);

// Handle VNPay IPN (Instant Payment Notification)
router.get('/vnpay/ipn', handleVNPayIPN);

export default router; 