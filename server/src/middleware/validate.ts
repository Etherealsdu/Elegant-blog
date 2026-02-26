/**
 * 请求参数验证中间件
 *
 * 封装 express-validator 的验证逻辑，提供统一的验证失败响应格式。
 *
 * 使用方式：
 * router.post('/register',
 *   validate([
 *     body('email').isEmail().withMessage('邮箱格式不正确'),
 *     body('password').isLength({ min: 8 }).withMessage('密码至少8位'),
 *   ]),
 *   controller.register
 * );
 *
 * 验证失败时返回 400，格式如下：
 * {
 *   "success": false,
 *   "error": "Validation failed",
 *   "details": [{ "field": "email", "message": "邮箱格式不正确" }]
 * }
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 并行执行所有验证规则
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // 验证失败，返回所有字段错误详情
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: (err as any).path,
        message: err.msg,
      })),
    });
  };
};
