import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class UploadController {
  static async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
