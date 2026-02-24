import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import config from '../config';

jest.mock('../config/database', () => {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });
  return {
    __esModule: true,
    default: sequelize,
    connectDatabase: jest.fn().mockResolvedValue(undefined),
  };
});

const mockPlans = [
  {
    id: 'plan-1',
    name: '月度会员',
    plan: 'monthly',
    price: 29.9,
    currency: 'CNY',
    durationDays: 30,
    description: '按月订阅',
    features: ['阅读全部订阅文章'],
    isActive: true,
  },
  {
    id: 'plan-2',
    name: '季度会员',
    plan: 'quarterly',
    price: 79.9,
    currency: 'CNY',
    durationDays: 90,
    description: '季度订阅',
    features: ['阅读全部订阅文章', '专属客服'],
    isActive: true,
  },
  {
    id: 'plan-3',
    name: '年度会员',
    plan: 'yearly',
    price: 259.9,
    currency: 'CNY',
    durationDays: 365,
    description: '年度订阅',
    features: ['阅读全部订阅文章', '专属客服', '年度赠品'],
    isActive: true,
  },
];

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn().mockResolvedValue(null),
    findByPk: jest.fn().mockResolvedValue({
      id: 'user-uuid-1',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
      toJSON: function () { return this; },
    }),
  },
  Post: { findByPk: jest.fn() },
  Category: { findAll: jest.fn().mockResolvedValue([]) },
  Tag: { findAll: jest.fn().mockResolvedValue([]) },
  PostTag: {},
  Comment: {},
  Like: {},
  MembershipPlan: {
    findAll: jest.fn().mockResolvedValue([
      { id: 'plan-1', name: '月度会员', plan: 'monthly', price: 29.9 },
    ]),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Subscription: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
  Payment: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    create: jest.fn().mockResolvedValue({
      id: 'pay-1',
      userId: 'user-uuid-1',
      amount: 29.9,
      currency: 'CNY',
      provider: 'stripe',
      status: 'pending',
      description: 'Subscription to 月度会员',
      update: jest.fn(),
    }),
  },
}));

const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: '1h' });
};

describe('Membership API', () => {
  describe('GET /api/membership/plans', () => {
    it('should return membership plans', async () => {
      const response = await request(app).get('/api/membership/plans');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/membership/subscription', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app).get('/api/membership/subscription');
      expect(response.status).toBe(401);
    });

    it('should return subscription status for authenticated user', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .get('/api/membership/subscription')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/membership/subscribe', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app)
        .post('/api/membership/subscribe')
        .send({ planId: 'plan-1', provider: 'stripe' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid plan ID', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/membership/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'invalid', provider: 'stripe' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid provider', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/membership/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', provider: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('should create subscription with valid data', async () => {
      const { MembershipPlan } = require('../models');
      MembershipPlan.findByPk.mockResolvedValue(mockPlans[0]);

      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/membership/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({
          planId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          provider: 'stripe',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/membership/payments', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app).get('/api/membership/payments');
      expect(response.status).toBe(401);
    });

    it('should return payment history', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .get('/api/membership/payments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
