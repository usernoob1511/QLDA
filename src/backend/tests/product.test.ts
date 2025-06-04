import request from 'supertest';
import app from '../app';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';
import { testDb } from './setup';
import jwt from 'jsonwebtoken';

describe('Product API', () => {
  let adminToken: string;
  let userToken: string;
  let testCategory: any;

  beforeAll(async () => {
    // Create test users
    const admin = await User.create({
      Email: 'admin@example.com',
      Password: 'Password123!',
      Name: 'Admin User',
      Role: 'admin' as const,
    });

    const user = await User.create({
      Email: 'user@example.com',
      Password: 'Password123!',
      Name: 'Regular User',
      Role: 'customer' as const,
    });

    adminToken = jwt.sign({ id: admin.UserID }, process.env.JWT_SECRET || 'secret');
    userToken = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET || 'secret');

    // Create test category
    testCategory = await Category.create({
      Name: 'Test Category',
      Description: 'Test Category Description',
    });
  });

  beforeEach(async () => {
    await Product.destroy({ where: {} }); // Clear products table
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.bulkCreate([
        {
          Name: 'Test Product 1',
          Description: 'Description 1',
          Price: 99.99,
          Stock: 10,
          CategoryID: testCategory.CategoryID,
        },
        {
          Name: 'Test Product 2',
          Description: 'Description 2',
          Price: 149.99,
          Stock: 5,
          CategoryID: testCategory.CategoryID,
        },
      ]);
    });

    it('should get all products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products[0]).toHaveProperty('Name');
      expect(response.body.data.products[0]).toHaveProperty('Price');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: testCategory.CategoryID });

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products[0].CategoryID).toBe(testCategory.CategoryID);
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.total).toBe(2);
    });
  });

  describe('POST /api/products', () => {
    const newProduct = {
      Name: 'New Product',
      Description: 'New Product Description',
      Price: 199.99,
      Stock: 15,
      CategoryID: 1,
    };

    it('should create product when admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.data.product.Name).toBe(newProduct.Name);
      expect(response.body.data.product.Price).toBe(newProduct.Price);
    });

    it('should not create product when not admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProduct);

      expect(response.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          Name: 'Test Product',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/products/:id', () => {
    let testProduct: any;

    beforeEach(async () => {
      testProduct = await Product.create({
        Name: 'Test Product',
        Description: 'Test Description',
        Price: 99.99,
        Stock: 10,
        CategoryID: testCategory.CategoryID,
      });
    });

    it('should update product when admin', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.ProductID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          Name: 'Updated Product',
          Price: 149.99,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.product.Name).toBe('Updated Product');
      expect(response.body.data.product.Price).toBe(149.99);
    });

    it('should not update product when not admin', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.ProductID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          Name: 'Updated Product',
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          Name: 'Updated Product',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let testProduct: any;

    beforeEach(async () => {
      testProduct = await Product.create({
        Name: 'Test Product',
        Description: 'Test Description',
        Price: 99.99,
        Stock: 10,
        CategoryID: testCategory.CategoryID,
      });
    });

    it('should delete product when admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.ProductID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deletedProduct = await Product.findByPk(testProduct.ProductID);
      expect(deletedProduct).toBeNull();
    });

    it('should not delete product when not admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.ProductID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);

      const product = await Product.findByPk(testProduct.ProductID);
      expect(product).not.toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 