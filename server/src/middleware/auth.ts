/**
 * 认证与授权中间件
 *
 * 提供三个中间件：
 * 1. authenticate  - 强制认证：必须携带有效的 JWT Token，否则返回 401
 * 2. optionalAuth  - 可选认证：有 Token 就解析用户，没有也放行
 * 3. authorize     - 角色授权：检查用户是否拥有指定角色权限
 *
 * 使用方式：
 * - 需要登录的接口：router.get('/profile', authenticate, handler)
 * - 可选登录的接口：router.get('/posts', optionalAuth, handler)
 * - 需要管理员权限：router.post('/categories', authenticate, authorize(UserRole.ADMIN), handler)
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../models';
import { UserRole } from '@elegant-blog/shared';

/** 扩展 Express Request 类型，添加 user 属性 */
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * 强制认证中间件
 * 从 Authorization 头中提取 Bearer Token，验证并加载用户信息到 req.user
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    // 提取 "Bearer xxx" 中的 token 部分
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

/**
 * 可选认证中间件
 * 如果请求携带了有效 Token，解析用户信息到 req.user；否则静默放行。
 * 适用于"登录后有额外功能"的接口（如文章列表可以显示当前用户的点赞状态）
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // 可选认证：Token 无效时不报错，继续处理请求
  }
  next();
};

/**
 * 角色授权中间件（工厂函数）
 * 验证当前用户是否拥有指定角色之一
 *
 * @param roles - 允许访问的角色列表
 * @returns Express 中间件函数
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
};
