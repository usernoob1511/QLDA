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
exports.sendPaymentConfirmationEmail = exports.sendOrderConfirmationEmail = void 0;
const User_1 = __importDefault(require("../models/User"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const AppError_1 = require("../utils/AppError");
// Initialize SendGrid with API key
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '');
/**
 * Formats the order data for email template
 */
const formatOrderData = (order) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findByPk(order.UserID);
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    const items = yield order.getProducts({
        through: { attributes: ['Quantity', 'Price'] }
    });
    const orderData = {
        orderNumber: order.OrderID.toString(),
        customerName: user.Name,
        orderDate: order.createdAt.toLocaleDateString(),
        items: items.map(item => ({
            name: item.product.Name,
            quantity: item.Quantity,
            price: item.product.Price,
            total: item.Quantity * item.product.Price,
        })),
        subtotal: items.reduce((sum, item) => sum + (item.Quantity * item.product.Price), 0),
        shipping: 0, // Free shipping
        total: order.TotalAmount,
        shippingAddress: {
            address: order.ShippingAddress,
            city: order.ShippingCity,
            state: order.ShippingState,
            zipCode: order.ShippingZipCode,
        },
    };
    return orderData;
});
/**
 * Generates HTML email template for order confirmation
 */
const generateOrderConfirmationHTML = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .order-info { margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
        .total-section { margin-top: 20px; border-top: 2px solid #ddd; padding-top: 20px; }
        .shipping-address { margin-top: 20px; padding: 20px; background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>

        <div class="order-info">
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Customer Name:</strong> ${data.customerName}</p>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p><strong>Subtotal:</strong> $${data.subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> ${data.shipping === 0 ? 'Free' : `$${data.shipping.toFixed(2)}`}</p>
          <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
        </div>

        <div class="shipping-address">
          <h3>Shipping Address:</h3>
          <p>${data.shippingAddress.address}</p>
          <p>${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
/**
 * Sends order confirmation email using SendGrid
 */
const sendOrderConfirmationEmail = (order) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = yield formatOrderData(order);
        const user = yield User_1.default.findByPk(order.UserID);
        if (!user || !user.Email) {
            throw new AppError_1.AppError('User email not found', 404);
        }
        const msg = {
            to: user.Email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
            subject: `Order Confirmation #${order.OrderID}`,
            html: generateOrderConfirmationHTML(orderData),
        };
        yield mail_1.default.send(msg);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        throw new AppError_1.AppError('Failed to send order confirmation email', 500);
    }
});
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
/**
 * Sends payment confirmation email using SendGrid
 */
const sendPaymentConfirmationEmail = (order) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByPk(order.UserID);
        if (!user || !user.Email) {
            throw new AppError_1.AppError('User email not found', 404);
        }
        const msg = {
            to: user.Email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
            subject: `Payment Confirmation for Order #${order.OrderID}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .content { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${user.Name},</p>
              <p>We have received your payment for Order #${order.OrderID}.</p>
              <p>Amount paid: $${order.TotalAmount.toFixed(2)}</p>
              <p>Payment date: ${order.createdAt.toLocaleDateString()}</p>
              <p>Thank you for your purchase!</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        yield mail_1.default.send(msg);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        throw new AppError_1.AppError('Failed to send payment confirmation email', 500);
    }
});
exports.sendPaymentConfirmationEmail = sendPaymentConfirmationEmail;
