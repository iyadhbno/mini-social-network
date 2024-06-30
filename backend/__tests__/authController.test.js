import request from 'supertest';
import app from '../src/app';
import User from '../src/models/user';
import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: `test${Date.now()}@example.com`,
          password: 'password123'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should not register a user with existing email', async () => {
      const email = `existing${Date.now()}@example.com`;
      await User.create({
        username: 'existinguser',
        email: email,
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: email,
          password: 'password123'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const email = `login${Date.now()}@example.com`;
      await User.create({
        username: 'loginuser',
        email: email,
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: email,
          password: 'password123'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login a user with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});