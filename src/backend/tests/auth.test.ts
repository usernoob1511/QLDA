import request from 'supertest';
import app from '../app';
import User from '../models/User';
import { testDb } from './setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} }); // Clear users table
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      Email: 'test@example.com',
      Password: 'Password123!',
      Name: 'Test User',
      Role: 'customer' as const,
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.user.Email).toBe(validUser.Email);
      expect(response.body.data.user).not.toHaveProperty('Password');
    });

    it('should not register user with existing email', async () => {
      await User.create({
        ...validUser,
        Password: await bcrypt.hash(validUser.Password, 10),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          Password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/password/i);
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      Email: 'test@example.com',
      Password: 'Password123!',
      Name: 'Test User',
      Role: 'customer' as const,
    };

    beforeEach(async () => {
      await User.create({
        ...testUser,
        Password: await bcrypt.hash(testUser.Password, 10),
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          Email: testUser.Email,
          Password: testUser.Password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.user.Email).toBe(testUser.Email);
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          Email: testUser.Email,
          Password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          Email: 'nonexistent@example.com',
          Password: testUser.Password,
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;
    const testUser = {
      Email: 'test@example.com',
      Password: 'Password123!',
      Name: 'Test User',
      Role: 'customer' as const,
    };

    beforeEach(async () => {
      const user = await User.create({
        ...testUser,
        Password: await bcrypt.hash(testUser.Password, 10),
      });
      token = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET || 'secret');
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.Email).toBe(testUser.Email);
      expect(response.body.data.user).not.toHaveProperty('Password');
    });

    it('should not allow access without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should not allow access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 