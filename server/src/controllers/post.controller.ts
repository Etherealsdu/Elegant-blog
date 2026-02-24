import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { AuthRequest } from '../middleware/auth';
import { MembershipService } from '../services/membership.service';
import { PostVisibility } from '@elegant-blog/shared';

export class PostController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.create({
        ...req.body,
        authorId: req.user!.id,
      });
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.findById(req.params.id);

      // Check visibility
      if (post.visibility === PostVisibility.SUBSCRIBERS_ONLY) {
        if (!req.user) {
          return res.status(403).json({
            success: false,
            error: 'This content is for subscribers only. Please subscribe to read.',
            requiresSubscription: true,
          });
        }
        const isSubscribed = await MembershipService.isSubscribed(req.user.id);
        if (!isSubscribed && post.authorId !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'This content is for subscribers only. Please subscribe to read.',
            requiresSubscription: true,
          });
        }
      }

      if (post.visibility === PostVisibility.PRIVATE && (!req.user || post.authorId !== req.user.id)) {
        return res.status(403).json({ success: false, error: 'This post is private' });
      }

      // Increment view count
      await PostService.incrementViewCount(post.id);

      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.findBySlug(req.params.slug);

      // Check visibility (same logic)
      if (post.visibility === PostVisibility.SUBSCRIBERS_ONLY) {
        if (!req.user) {
          return res.status(403).json({
            success: false,
            error: 'This content is for subscribers only',
            requiresSubscription: true,
          });
        }
        const isSubscribed = await MembershipService.isSubscribed(req.user.id);
        if (!isSubscribed && post.authorId !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'This content is for subscribers only',
            requiresSubscription: true,
          });
        }
      }

      if (post.visibility === PostVisibility.PRIVATE && (!req.user || post.authorId !== req.user.id)) {
        return res.status(403).json({ success: false, error: 'This post is private' });
      }

      await PostService.incrementViewCount(post.id);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, categoryId, tagId, authorId, search, status } = req.query;
      const result = await PostService.list({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        categoryId: categoryId as string,
        tagId: tagId as string,
        authorId: authorId as string,
        search: search as string,
        status: status as any,
        userId: req.user?.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.update(req.params.id, req.user!.id, req.body);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PostService.delete(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PostService.toggleLike(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
