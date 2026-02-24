import request from 'supertest';
import app from '../app';

// Mock database
jest.mock('../config/database', () => {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });
  return {
    __esModule: true,
    default: sequelize,
    connectDatabase: jest.fn().mockResolvedValue(undefined),
  };
});

// Mock models
jest.mock('../models', () => {
  const mockUser = {
    id: 'test-uuid-1',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    role: 'user',
    provider: 'local',
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: function () {
      const { password, ...rest } = this;
      return rest;
    },
    comparePassword: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
  };

  return {
    User: {
      findOne: jest.fn().mockResolvedValue(null),
      findByPk: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
    },
    Post: { findAll: jest.fn(), findByPk: jest.fn() },
    Category: { findAll: jest.fn() },
    Tag: { findAll: jest.fn() },
    PostTag: {},
    Comment: { findAll: jest.fn() },
    Like: { findOne: jest.fn() },
    MembershipPlan: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
    Subscription: { findOne: jest.fn() },
    Payment: { findByPk: jest.fn() },
  };
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'ab',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should register successfully with valid data', async () => {
      const { User } = require('../models');
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'password123',
          displayName: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      const { User } = require('../models');
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nouser@example.com', password: 'password123' });

      expect(response.status).toBe(401);
    });

    it('should login successfully with valid credentials', async () => {
      const { User } = require('../models');
      User.findOne.mockResolvedValue({
        id: 'test-uuid-1',
        email: 'test@example.com',
        password: 'hashedpassword',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: function () {
          return { id: this.id, email: this.email };
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.status).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('GET /api/health should return status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });
});
