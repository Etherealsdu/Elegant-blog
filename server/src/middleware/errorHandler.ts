/**
 * 全局错误处理中间件
 *
 * 提供统一的错误响应格式：
 * - AppError：业务逻辑错误（如"文章不存在"），返回对应的 HTTP 状态码
 * - 其他 Error：未预期的程序错误，生产环境隐藏详细信息，开发环境返回堆栈
 *
 * 所有错误都会写入 Winston 日志（error.log 和 combined.log）
 */
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';

/**
 * 业务错误类
 *
 * 用于在 Service 层抛出带有 HTTP 状态码的错误。
 * 示例：throw new AppError('Post not found', 404);
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;  // 标记为可预期的业务错误

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 全局错误处理中间件（Express 四参数中间件）
 * 必须放在所有路由之后注册
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // 记录错误日志
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // 业务错误：返回对应状态码和消息
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // 未知错误：生产环境隐藏详情，开发环境返回完整信息
  const statusCode = 500;
  const message = config.env === 'production' ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.env !== 'production' && { stack: err.stack }),
  });
};

/** 404 路由未找到处理 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
