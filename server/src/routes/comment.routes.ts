import { Router } from 'express';
import { body } from 'express-validator';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.get('/post/:postId', CommentController.listByPost);

// Protected
router.post(
  '/',
  authenticate,
  validate([
    body('content').notEmpty().isLength({ max: 5000 }).withMessage('Comment content is required (max 5000 chars)'),
    body('postId').isUUID().withMessage('Valid post ID is required'),
    body('parentId').optional().isUUID().withMessage('Valid parent comment ID required'),
  ]),
  CommentController.create
);

router.delete('/:id', authenticate, CommentController.delete);

export default router;
