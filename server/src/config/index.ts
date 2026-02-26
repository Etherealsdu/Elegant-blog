/**
 * 全局配置文件
 *
 * 从环境变量（.env 文件）读取配置，并提供合理的默认值。
 * 生产环境部署时，务必修改所有默认值（尤其是密钥和数据库连接）。
 *
 * 配置项包括：
 * - 基础配置（端口、环境、前端 URL）
 * - 数据库连接（PostgreSQL）
 * - 缓存连接（Redis）
 * - JWT 认证密钥及过期时间
 * - OAuth 第三方登录（GitHub、Google、微信、支付宝）
 * - 支付集成（Stripe、微信支付、支付宝）
 * - 文件上传限制
 * - 邮件发送（SMTP）
 */
import dotenv from 'dotenv';
import path from 'path';

// 从 server/.env 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // ===== 基础配置 =====
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // ===== 数据库配置（PostgreSQL） =====
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/elegant_blog',
    logging: process.env.NODE_ENV !== 'production', // 生产环境关闭 SQL 日志
  },

  // ===== 缓存配置（Redis） =====
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // ===== JWT 认证配置 =====
  // 注意：生产环境必须使用强随机字符串（至少 64 字符），切勿使用默认值！
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',           // Access Token 有效期
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',  // Refresh Token 有效期
  },

  // ===== OAuth 第三方登录配置 =====
  oauth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      callbackUrl: process.env.WECHAT_CALLBACK_URL || 'http://localhost:5000/api/auth/wechat/callback',
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      callbackUrl: process.env.ALIPAY_CALLBACK_URL || 'http://localhost:5000/api/auth/alipay/callback',
    },
  },

  // ===== 支付配置 =====
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    wechatPay: {
      mchId: process.env.WECHAT_PAY_MCH_ID || '',     // 微信支付商户号
      apiKey: process.env.WECHAT_PAY_API_KEY || '',     // 微信支付 API 密钥
      notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '', // 支付结果通知回调 URL
    },
    alipay: {
      notifyUrl: process.env.ALIPAY_NOTIFY_URL || '',   // 支付宝异步通知 URL
    },
  },

  // ===== 文件上传配置 =====
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',                      // 上传文件存储目录（相对于 server 根目录）
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 最大文件大小（默认 10MB）
  },

  // ===== 邮件发送配置（SMTP） =====
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@elegantblog.com',
  },
};

export default config;
