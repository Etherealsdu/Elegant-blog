/**
 * Express 应用配置
 *
 * 职责：
 * 1. 配置安全中间件（Helmet、CORS、速率限制）
 * 2. 配置请求解析（JSON、URL 编码、Cookie）
 * 3. 配置静态文件服务（上传文件和生产环境前端文件）
 * 4. 挂载 API 路由
 * 5. 配置全局错误处理
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// === 安全中间件 ===

// Helmet：自动设置各种 HTTP 安全头（X-Frame-Options, CSP 等）
app.use(helmet());

// CORS：跨域资源共享配置，仅允许前端域名访问
app.use(
  cors({
    origin: config.clientUrl,   // 允许的前端域名（如 http://localhost:3000）
    credentials: true,          // 允许携带 Cookie
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 速率限制：防止暴力攻击和 API 滥用
// 每个 IP 在 15 分钟内最多 100 次请求
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟窗口期
  max: 100,                   // 每个 IP 的最大请求数
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// === 请求体解析 ===
app.use(express.json({ limit: '10mb' }));          // JSON 请求体，最大 10MB
app.use(express.urlencoded({ extended: true }));    // URL 编码的表单数据
app.use(cookieParser());                            // Cookie 解析

// === 静态文件服务 ===
// 将 /uploads 路径映射到服务器的 uploads 目录，供前端访问上传的图片
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

// === API 路由 ===
// 所有 API 路由以 /api 为前缀
app.use('/api', routes);

// === 生产环境：提供前端 React 静态文件 ===
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  // SPA 路由回退：所有非 API 请求都返回 index.html，由前端路由处理
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// === 错误处理（必须放在路由之后） ===
app.use(notFoundHandler);  // 404 处理
app.use(errorHandler);      // 全局错误处理

export default app;
