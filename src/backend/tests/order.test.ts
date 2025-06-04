import request from 'supertest';
import app from '../app';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Cart from '../models/Cart';
import { testDb } from './setup';
import jwt from 'jsonwebtoken';

describe('Order API', () => {
  let userToken: string;
  let adminToken: string;
  let testUser: any;
  let testProduct: any;
  let testOrder: any;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      Email: 'user@example.com',
      Password: 'Password123!',
      Name: 'Test User',
      Role: 'customer' as const,
    });

    // Create admin user
    const admin = await User.create({
      Email: 'admin@example.com',
      Password: 'Password123!',
      Name: 'Admin User',
      Role: 'admin' as const,
    });

    userToken = jwt.sign({ id: testUser.UserID }, process.env.JWT_SECRET || 'secret');
    adminToken = jwt.sign({ id: admin.UserID }, process.env.JWT_SECRET || 'secret');

    // Create test product
    testProduct = await Product.create({
      Name: 'Test Product',
      Description: 'Test Description',
      Price: 99.99,
      Stock: 10,
      CategoryID: 1,
    });
  });

  beforeEach(async () => {
    await Order.destroy({ where: {} }); // Clear orders table
    await Cart.destroy({ where: {} }); // Clear cart table
  });

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      // Add items to cart
      await Cart.create({
        UserID: testUser.UserID,
        ProductID: testProduct.ProductID,
        Quantity: 2,
      });
    });

    const orderData = {
      shippingDetails: {
        fullName: 'Test User',
        email: 'user@example.com',
        phone: '1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
      },
    };

    it('should create order from cart items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.data.order).toHaveProperty('OrderID');
      expect(response.body.data.order.TotalAmount).toBe(199.98); // 99.99 * 2
      expect(response.body.data.order.Status).toBe('Pending');

      // Check if cart is cleared
      const cartItems = await Cart.findAll({ where: { UserID: testUser.UserID } });
      expect(cartItems).toHaveLength(0);

      // Check if product stock is updated
      const updatedProduct = await Product.findByPk(testProduct.ProductID);
      expect(updatedProduct).not.toBeNull();
      expect(updatedProduct!.Stock).toBe(8); // 10 - 2
    });

    it('should validate shipping details', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingDetails: {
            fullName: 'Test User',
            // Missing required fields
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/shipping/i);
    });

    it('should not create order with empty cart', async () => {
      await Cart.destroy({ where: { UserID: testUser.UserID } });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/cart/i);
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test order
      testOrder = await Order.create({
        UserID: testUser.UserID,
        TotalAmount: 199.98,
        Status: 'Pending',
        ShippingAddress: '123 Test St',
        ShippingCity: 'Test City',
        ShippingState: 'Test State',
        ShippingZipCode: '12345',
        ShippingName: 'Test User',
        ShippingEmail: 'user@example.com',
        ShippingPhone: '1234567890',
      });

      // Add order items
      await testOrder.addProduct(testProduct, {
        through: {
          Quantity: 2,
          Price: 99.99,
        },
      });
    });

    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].OrderID).toBe(testOrder.OrderID);
      expect(response.body.data.orders[0].TotalAmount).toBe(199.98);
    });

    it('should get all orders as admin', async () => {
      // Create another user's order
      const otherUser = await User.create({
        Email: 'other@example.com',
        Password: 'Password123!',
        Name: 'Other User',
        Role: 'customer' as const,
      });

      await Order.create({
        UserID: otherUser.UserID,
        TotalAmount: 99.99,
        Status: 'Pending',
        ShippingAddress: '456 Test St',
        ShippingCity: 'Test City',
        ShippingState: 'Test State',
        ShippingZipCode: '12345',
        ShippingName: 'Other User',
        ShippingEmail: 'other@example.com',
        ShippingPhone: '0987654321',
      });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orders).toHaveLength(2);
    });
  });

  describe('GET /api/orders/:id', () => {
    beforeEach(async () => {
      // Create test order
      testOrder = await Order.create({
        UserID: testUser.UserID,
        TotalAmount: 199.98,
        Status: 'Pending',
        ShippingAddress: '123 Test St',
        ShippingCity: 'Test City',
        ShippingState: 'Test State',
        ShippingZipCode: '12345',
        ShippingName: 'Test User',
        ShippingEmail: 'user@example.com',
        ShippingPhone: '1234567890',
      });

      await testOrder.addProduct(testProduct, {
        through: {
          Quantity: 2,
          Price: 99.99,
        },
      });
    });

    it('should get order details', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.OrderID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.OrderID).toBe(testOrder.OrderID);
      expect(response.body.data.order.products).toHaveLength(1);
      expect(response.body.data.order.products[0].ProductID).toBe(testProduct.ProductID);
    });

    it('should not allow access to other user orders', async () => {
      const otherUser = await User.create({
        Email: 'other@example.com',
        Password: 'Password123!',
        Name: 'Other User',
        Role: 'customer' as const,
      });
      const otherToken = jwt.sign({ id: otherUser.UserID }, process.env.JWT_SECRET || 'secret');

      const response = await request(app)
        .get(`/api/orders/${testOrder.OrderID}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);
    });

    it('should allow admin to access any order', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.OrderID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.OrderID).toBe(testOrder.OrderID);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    beforeEach(async () => {
      testOrder = await Order.create({
        UserID: testUser.UserID,
        TotalAmount: 199.98,
        Status: 'Pending',
        ShippingAddress: '123 Test St',
        ShippingCity: 'Test City',
        ShippingState: 'Test State',
        ShippingZipCode: '12345',
        ShippingName: 'Test User',
        ShippingEmail: 'user@example.com',
        ShippingPhone: '1234567890',
      });
    });

    it('should update order status as admin', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.OrderID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(response.status).toBe(200);
      expect(response.body.data.order.Status).toBe('processing');
    });

    it('should not allow status update as regular user', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.OrderID}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'processing' });

      expect(response.status).toBe(403);
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.OrderID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/status/i);
    });
  });
}); 