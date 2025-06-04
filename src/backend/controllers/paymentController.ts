import { Request, Response } from 'express';
import crypto from 'crypto';
import qs from 'qs';
import dotenv from 'dotenv';

dotenv.config();

const vnpayConfig = {
  tmnCode: process.env.VNP_TMN_CODE || '',
  hashSecret: process.env.VNP_HASH_SECRET || '',
  url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay/return',
};

export const createVNPayPayment = async (req: Request, res: Response) => {
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

    const signData = qs.stringify(vnpParams);
    const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    (vnpParams as any)['vnp_SecureHash'] = signed;

    const vnpUrl = vnpayConfig.url + '?' + qs.stringify(vnpParams);
    res.json({ url: vnpUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment URL' });
  }
};

export const handleVNPayReturn = (req: Request, res: Response) => {
  try {
    const vnpParams = req.query;
    const secureHash = vnpParams.vnp_SecureHash as string;
    
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const signData = qs.stringify(vnpParams as any);
    const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const responseCode = vnpParams.vnp_ResponseCode;
      if (responseCode === '00') {
        res.json({ status: 'success', message: 'Payment successful' });
      } else {
        res.json({ status: 'error', message: 'Payment failed' });
      }
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const handleVNPayIPN = (req: Request, res: Response) => {
  try {
    const vnpParams = req.query;
    const secureHash = vnpParams.vnp_SecureHash as string;
    
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const signData = qs.stringify(vnpParams as any);
    const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const responseCode = vnpParams.vnp_ResponseCode;
      if (responseCode === '00') {
        // Update order status in database here
        res.status(200).json({ RspCode: '00', Message: 'Success' });
      } else {
        res.status(200).json({ RspCode: '99', Message: 'Payment failed' });
      }
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
}; 