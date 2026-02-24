import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthRequest } from '../middleware/auth';

export class CommentController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.create({
        content: req.body.content,
        postId: req.body.postId,
        authorId: req.user!.id,
        parentId: req.body.parentId,
      });
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  static async listByPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query;
      const result = await CommentService.listByPost(
        req.params.postId,
        page ? parseInt(page as string) : undefined,
        pageSize ? parseInt(pageSize as string) : undefined
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CommentService.delete(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
