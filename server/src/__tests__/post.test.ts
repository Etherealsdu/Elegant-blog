import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import config from '../config';

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

const mockPost = {
  id: 'post-uuid-1',
  title: 'Test Post',
  slug: 'test-post-123',
  content: '# Hello World\nThis is a test post.',
  excerpt: 'This is a test post.',
  authorId: 'user-uuid-1',
  visibility: 'public',
  status: 'published',
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: {
    id: 'user-uuid-1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: null,
  },
  tags: [],
  category: null,
  toJSON: function () { return this; },
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
};

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  role: 'user',
  provider: 'local',
  isEmailVerified: false,
  toJSON: function () { return this; },
};

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
    create: jest.fn(),
  },
  Post: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    create: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  },
  Category: {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn(),
  },
  Tag: {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn(),
  },
  PostTag: {
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
  },
  Comment: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    destroy: jest.fn(),
  },
  Like: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
  MembershipPlan: {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Subscription: {
    findOne: jest.fn().mockResolvedValue(null),
  },
  Payment: { findByPk: jest.fn() },
}));

const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: '1h' });
};

describe('Post API', () => {
  describe('GET /api/posts', () => {
    it('should return paginated posts', async () => {
      const response = await request(app).get('/api/posts');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should accept query parameters', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ page: 1, pageSize: 10, search: 'test' });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/posts', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'Test', content: 'Content', visibility: 'public', status: 'draft' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid visibility', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Post',
          content: 'Content',
          visibility: 'invalid',
          status: 'draft',
        });

      expect(response.status).toBe(400);
    });

    it('should create post with valid data', async () => {
      const { Post } = require('../models');
      Post.create.mockResolvedValue(mockPost);
      Post.findByPk.mockResolvedValue(mockPost);

      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Post',
          content: '# Test\nContent here',
          visibility: 'public',
          status: 'draft',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return 404 for non-existent post', async () => {
      const { Post } = require('../models');
      Post.findByPk.mockResolvedValue(null);

      const response = await request(app).get('/api/posts/nonexistent-id');
      expect(response.status).toBe(404);
    });

    it('should return post by ID', async () => {
      const { Post } = require('../models');
      Post.findByPk.mockResolvedValue(mockPost);

      const response = await request(app).get('/api/posts/post-uuid-1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app)
        .put('/api/posts/post-uuid-1')
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app).delete('/api/posts/post-uuid-1');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app).post('/api/posts/post-uuid-1/like');
      expect(response.status).toBe(401);
    });
  });
});

describe('Comment API', () => {
  describe('GET /api/comments/post/:postId', () => {
    it('should return comments for a post', async () => {
      const response = await request(app).get('/api/comments/post/post-uuid-1');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/comments', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({ content: 'Nice post!', postId: 'post-uuid-1' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing content', async () => {
      const token = generateTestToken('user-uuid-1');
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});

describe('Category API', () => {
  describe('GET /api/categories', () => {
    it('should return categories list', async () => {
      const { Category } = require('../models');
      Category.findAll.mockResolvedValue([]);

      const response = await request(app).get('/api/categories');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe('Tag API', () => {
  describe('GET /api/tags', () => {
    it('should return tags list', async () => {
      const { Tag } = require('../models');
      Tag.findAll.mockResolvedValue([]);

      const response = await request(app).get('/api/tags');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
