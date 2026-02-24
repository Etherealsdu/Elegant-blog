import { Router } from 'express';
import { body } from 'express-validator';
import { CategoryController, TagController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@elegant-blog/shared';

const router = Router();

// Categories
router.get('/categories', CategoryController.list);
router.post(
  '/categories',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([body('name').notEmpty().isLength({ max: 100 }).withMessage('Category name is required')]),
  CategoryController.create
);
router.put('/categories/:id', authenticate, authorize(UserRole.ADMIN), CategoryController.update);
router.delete('/categories/:id', authenticate, authorize(UserRole.ADMIN), CategoryController.delete);

// Tags
router.get('/tags', TagController.list);
router.post(
  '/tags',
  authenticate,
  validate([body('name').notEmpty().isLength({ max: 50 }).withMessage('Tag name is required')]),
  TagController.create
);
router.delete('/tags/:id', authenticate, authorize(UserRole.ADMIN), TagController.delete);

export default router;
