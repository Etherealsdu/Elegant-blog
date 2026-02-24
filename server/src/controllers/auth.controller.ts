import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password, displayName } = req.body;
      const result = await AuthService.register({ email, username, password, displayName });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    res.json({ success: true, data: req.user?.toJSON() });
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { displayName, bio, avatar } = req.body;
      await req.user!.update({ displayName, bio, avatar });
      res.json({ success: true, data: req.user!.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  // OAuth callback handler
  static async oauthCallback(req: AuthRequest, res: Response) {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }

    const accessToken = AuthService.generateAccessToken(user.id);
    const refreshToken = AuthService.generateRefreshToken(user.id);

    // Redirect to client with tokens
    res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
}
