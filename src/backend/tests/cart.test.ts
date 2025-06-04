import request from 'supertest';
import app from '../app';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import { testDb } from './setup';
import jwt from 'jsonwebtoken';

describe('Cart API', () => {
  let userToken: string;
  let testUser: any;
  let testProduct: any;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      Email: 'user@example.com',
      Password: 'Password123!',
      Name: 'Test User',
      Role: 'customer' as const,
    });

    userToken = jwt.sign({ id: testUser.UserID }, process.env.JWT_SECRET || 'secret');

    // Create test product
    testProduct = await Product.create({
      Name: 'Test Product',
      Description: 'Test Description',
      Price: 99.99,
      Stock: 10,
      CategoryID: 1, // Default category ID for testing
    });
  });

  beforeEach(async () => {
    await Cart.destroy({ where: {} }); // Clear cart table
  });

  describe('GET /api/cart', () => {
    beforeEach(async () => {
      await Cart.create({
        UserID: testUser.UserID,
        ProductID: testProduct.ProductID,
        Quantity: 2,
      });
    });

    it('should get user cart items', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.cart).toHaveLength(1);
      expect(response.body.data.cart[0].ProductID).toBe(testProduct.ProductID);
      expect(response.body.data.cart[0].Quantity).toBe(2);
    });

    it('should not allow access without token', async () => {
      const response = await request(app).get('/api/cart');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct.ProductID,
          quantity: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.cartItem.ProductID).toBe(testProduct.ProductID);
      expect(response.body.data.cartItem.Quantity).toBe(1);
    });

    it('should update quantity if item already in cart', async () => {
      // Add initial item
      await Cart.create({
        UserID: testUser.UserID,
        ProductID: testProduct.ProductID,
        Quantity: 1,
      });

      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct.ProductID,
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.cartItem.Quantity).toBe(3); // 1 + 2
    });

    it('should validate stock availability', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct.ProductID,
          quantity: 20, // More than available stock
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/stock/i);
    });
  });

  describe('PUT /api/cart/:id', () => {
    let cartItem: any;

    beforeEach(async () => {
      cartItem = await Cart.create({
        UserID: testUser.UserID,
        ProductID: testProduct.ProductID,
        Quantity: 1,
      });
    });

    it('should update cart item quantity', async () => {
      const response = await request(app)
        .put(`/api/cart/${cartItem.CartID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.cartItem.Quantity).toBe(3);
    });

    it('should validate stock availability on update', async () => {
      const response = await request(app)
        .put(`/api/cart/${cartItem.CartID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 20, // More than available stock
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/stock/i);
    });

    it('should not update other user cart items', async () => {
      const otherUser = await User.create({
        Email: 'other@example.com',
        Password: 'Password123!',
        Name: 'Other User',
        Role: 'customer' as const,
      });
      const otherToken = jwt.sign({ id: otherUser.UserID }, process.env.JWT_SECRET || 'secret');

      const response = await request(app)
        .put(`/api/cart/${cartItem.CartID}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          quantity: 3,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/cart/:id', () => {
    let cartItem: any;

    beforeEach(async () => {
      cartItem = await Cart.create({
        UserID: testUser.UserID,
        ProductID: testProduct.ProductID,
        Quantity: 1,
      });
    });

    it('should remove item from cart', async () => {
      const response = await request(app)
        .delete(`/api/cart/${cartItem.CartID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      const deletedItem = await Cart.findByPk(cartItem.CartID);
      expect(deletedItem).toBeNull();
    });

    it('should not delete other user cart items', async () => {
      const otherUser = await User.create({
        Email: 'other@example.com',
        Password: 'Password123!',
        Name: 'Other User',
        Role: 'customer' as const,
      });
      const otherToken = jwt.sign({ id: otherUser.UserID }, process.env.JWT_SECRET || 'secret');

      const response = await request(app)
        .delete(`/api/cart/${cartItem.CartID}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);

      const item = await Cart.findByPk(cartItem.CartID);
      expect(item).not.toBeNull();
    });
  });
}); 