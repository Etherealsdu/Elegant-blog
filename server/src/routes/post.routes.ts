import { Router } from 'express';
import { body } from 'express-validator';
import { PostController } from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public routes (with optional auth for visibility)
router.get('/', optionalAuth, PostController.list);
router.get('/slug/:slug', optionalAuth, PostController.getBySlug);
router.get('/:id', optionalAuth, PostController.getById);

// Protected routes
router.post(
  '/',
  authenticate,
  validate([
    body('title').notEmpty().isLength({ max: 500 }).withMessage('Title is required (max 500 chars)'),
    body('content').notEmpty().withMessage('Content is required'),
    body('visibility').isIn(['public', 'subscribers_only', 'private']).withMessage('Invalid visibility'),
    body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  ]),
  PostController.create
);

router.put(
  '/:id',
  authenticate,
  validate([
    body('title').optional().isLength({ max: 500 }),
    body('visibility').optional().isIn(['public', 'subscribers_only', 'private']),
    body('status').optional().isIn(['draft', 'published', 'archived']),
  ]),
  PostController.update
);

router.delete('/:id', authenticate, PostController.delete);
router.post('/:id/like', authenticate, PostController.toggleLike);

export default router;
