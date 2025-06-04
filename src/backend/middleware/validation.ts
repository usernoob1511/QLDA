import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// ... existing code ...

export const validatePaymentRequest = (req: Request, res: Response, next: NextFunction) => {
  const { orderId, amount, orderInfo } = req.body;

  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }

  if (!amount || amount <= 0) {
    throw new AppError('Valid amount is required', 400);
  }

  if (!orderInfo) {
    throw new AppError('Order information is required', 400);
  }

  next();
}; 