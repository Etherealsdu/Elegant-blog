import { Request, Response, NextFunction } from 'express';
import { Category, Tag } from '../models';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';

export class CategoryController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.findAll({
        include: [{ model: Category, as: 'children' }],
        where: { parentId: null },
        order: [['name', 'ASC']],
      });
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, parentId } = req.body;
      const slug = slugify(name, { lower: true, strict: true });

      const existing = await Category.findOne({ where: { slug } });
      if (existing) {
        throw new AppError('Category already exists', 409);
      }

      const category = await Category.create({ name, slug, description, parentId });
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        throw new AppError('Category not found', 404);
      }

      const { name, description } = req.body;
      if (name) {
        await category.update({ name, slug: slugify(name, { lower: true, strict: true }), description });
      } else {
        await category.update({ description });
      }

      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      await category.destroy();
      res.json({ success: true, data: { message: 'Category deleted' } });
    } catch (error) {
      next(error);
    }
  }
}

export class TagController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await Tag.findAll({ order: [['postCount', 'DESC']] });
      res.json({ success: true, data: tags });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const slug = slugify(name, { lower: true, strict: true });

      const existing = await Tag.findOne({ where: { slug } });
      if (existing) {
        return res.json({ success: true, data: existing });
      }

      const tag = await Tag.create({ name, slug });
      res.status(201).json({ success: true, data: tag });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      if (!tag) {
        throw new AppError('Tag not found', 404);
      }
      await tag.destroy();
      res.json({ success: true, data: { message: 'Tag deleted' } });
    } catch (error) {
      next(error);
    }
  }
}
