import Order from '../models/Order';
import User from '../models/User';
import sgMail from '@sendgrid/mail';
import { AppError } from '../utils/AppError';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface OrderProduct {
  ProductID: number;
  Name: string;
  Price: number;
  Quantity: number;
  product: {
    Name: string;
    Price: number;
  };
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

/**
 * Formats the order data for email template
 */
const formatOrderData = async (order: Order): Promise<OrderEmailData> => {
  const user = await User.findByPk(order.UserID);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const items = await order.getProducts({
    through: { attributes: ['Quantity', 'Price'] }
  }) as unknown as OrderProduct[];

  const orderData: OrderEmailData = {
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
};

/**
 * Generates HTML email template for order confirmation
 */
const generateOrderConfirmationHTML = (data: OrderEmailData): string => {
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
export const sendOrderConfirmationEmail = async (order: Order): Promise<void> => {
  try {
    const orderData = await formatOrderData(order);
    const user = await User.findByPk(order.UserID);

    if (!user || !user.Email) {
      throw new AppError('User email not found', 404);
    }

    const msg = {
      to: user.Email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject: `Order Confirmation #${order.OrderID}`,
      html: generateOrderConfirmationHTML(orderData),
    };

    await sgMail.send(msg);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to send order confirmation email', 500);
  }
};

/**
 * Sends payment confirmation email using SendGrid
 */
export const sendPaymentConfirmationEmail = async (order: Order): Promise<void> => {
  try {
    const user = await User.findByPk(order.UserID);

    if (!user || !user.Email) {
      throw new AppError('User email not found', 404);
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

    await sgMail.send(msg);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to send payment confirmation email', 500);
  }
}; 