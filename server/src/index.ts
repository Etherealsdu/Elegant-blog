/**
 * 服务器入口文件
 *
 * 职责：
 * 1. 创建必要的目录（上传目录、日志目录）
 * 2. 连接数据库并同步模型
 * 3. 初始化默认会员计划数据
 * 4. 启动 HTTP 服务器监听端口
 */
import app from './app';
import config from './config';
import { connectDatabase } from './config/database';
import { MembershipService } from './services/membership.service';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';

const start = async () => {
  try {
    // 确保上传目录存在（用于存储用户上传的图片）
    const uploadDir = path.join(__dirname, '..', config.upload.dir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 确保日志目录存在（Winston 会写入 combined.log 和 error.log）
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 连接 PostgreSQL 数据库并同步 ORM 模型
    await connectDatabase();

    // 初始化默认会员计划（月度/季度/年度），如果已存在则跳过
    await MembershipService.seedDefaultPlans();
    logger.info('Default membership plans seeded');

    // 启动 Express HTTP 服务器
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
