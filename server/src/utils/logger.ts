/**
 * 日志工具
 *
 * 基于 Winston 日志库，配置了两种输出：
 * 1. 文件日志：
 *    - logs/error.log  - 仅记录 error 级别日志
 *    - logs/combined.log - 记录所有级别日志
 * 2. 控制台日志（仅开发环境）：彩色输出，方便调试
 *
 * 日志级别：
 * - production 环境：info 及以上（info, warn, error）
 * - development 环境：debug 及以上（debug, info, warn, error）
 *
 * 日志格式：JSON + 时间戳 + 错误堆栈
 */
import winston from 'winston';
import config from '../config';

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),  // 自动记录 Error 对象的堆栈信息
    winston.format.json()
  ),
  defaultMeta: { service: 'elegant-blog' },  // 所有日志附带服务标识
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// 开发环境：额外输出到控制台，使用彩色格式
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
