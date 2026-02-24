# Elegant Blog - 部署与运维文档

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [环境要求](#3-环境要求)
4. [本地开发环境搭建](#4-本地开发环境搭建)
5. [Docker 部署](#5-docker-部署)
6. [生产环境部署](#6-生产环境部署)
7. [数据库管理](#7-数据库管理)
8. [第三方服务配置](#8-第三方服务配置)
9. [监控与日志](#9-监控与日志)
10. [备份与恢复](#10-备份与恢复)
11. [常见问题排查](#11-常见问题排查)
12. [安全配置](#12-安全配置)

---

## 1. 项目概述

Elegant Blog 是一个基于 React + Node.js 的全栈博客平台，采用 monorepo 架构，包含以下模块：

```
Elegant-blog/
├── client/          # React 前端应用
├── server/          # Node.js/Express 后端 API
├── shared/          # 共享类型定义
├── docs/            # 文档
├── docker-compose.yml
├── Dockerfile.server
├── Dockerfile.client
└── nginx.conf
```

### 核心功能
- **Markdown 编辑器**: 带工具栏的所见即所得编辑器，支持 GFM 语法
- **用户系统**: 注册/登录 + GitHub/Google/微信/支付宝 OAuth
- **博客管理**: CRUD、分类、标签、搜索
- **评论系统**: 支持嵌套回复
- **分享功能**: 微信/微博/Twitter/Facebook/链接复制
- **会员体系**: 月/季/年订阅，支持 Stripe/微信支付/支付宝
- **内容可见性**: 公开/订阅专享/私密

## 2. 技术架构

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| React Router | 6.x | 路由管理 |
| Zustand | 4.x | 状态管理 |
| Axios | 1.x | HTTP 客户端 |
| react-markdown | 9.x | Markdown 渲染 |
| react-hot-toast | 2.x | 通知提示 |
| react-icons | 4.x | 图标库 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20.x LTS | 运行时 |
| Express | 4.x | Web 框架 |
| TypeScript | 5.x | 类型安全 |
| Sequelize | 6.x | ORM |
| PostgreSQL | 16.x | 主数据库 |
| Redis | 7.x | 缓存/Session |
| JWT | - | 认证 |
| Passport | 0.7.x | OAuth 集成 |
| Stripe | 14.x | 国际支付 |
| Winston | 3.x | 日志 |

### 基础设施
| 技术 | 用途 |
|------|------|
| Docker | 容器化 |
| Docker Compose | 编排 |
| Nginx | 反向代理 + 静态文件 |

## 3. 环境要求

### 本地开发
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14
- Redis >= 6
- Git

### 生产部署
- Docker >= 24.0
- Docker Compose >= 2.20
- 最低 2 核 CPU, 4GB 内存
- 20GB+ 磁盘空间
- 域名 + SSL 证书

## 4. 本地开发环境搭建

### 4.1 克隆项目

```bash
git clone https://github.com/Etherealsdu/Elegant-blog.git
cd Elegant-blog
```

### 4.2 安装依赖

```bash
npm install
```

### 4.3 配置环境变量

```bash
cp .env.example server/.env
```

编辑 `server/.env`，至少配置以下内容：

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/elegant_blog
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-dev-secret-key-at-least-32-chars
JWT_REFRESH_SECRET=your-dev-refresh-secret-key
```

### 4.4 创建数据库

```bash
# 连接 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE elegant_blog;
\q
```

### 4.5 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server   # 后端 http://localhost:5000
npm run dev:client   # 前端 http://localhost:3000
```

### 4.6 运行测试

```bash
# 运行全部测试
npm test

# 分别运行
npm run test:server
npm run test:client
```

## 5. Docker 部署

### 5.1 快速启动

```bash
# 创建环境文件
cp .env.example .env
# 编辑 .env 设置生产环境变量

# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5.2 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| client | 80/443 | Nginx + React 前端 |
| server | 5000 | Express API |
| postgres | 5432 | PostgreSQL 数据库 |
| redis | 6379 | Redis 缓存 |

### 5.3 常用 Docker 命令

```bash
# 重启单个服务
docker-compose restart server

# 重建并更新某个服务
docker-compose up -d --build server

# 查看日志
docker-compose logs -f server

# 进入容器
docker-compose exec server sh
docker-compose exec postgres psql -U postgres -d elegant_blog

# 停止所有服务
docker-compose down

# 停止并删除数据卷（警告：会删除数据！）
docker-compose down -v
```

## 6. 生产环境部署

### 6.1 服务器准备 (Ubuntu 22.04)

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 安装 Certbot (SSL)
sudo apt install certbot -y
```

### 6.2 配置域名

1. 将域名 A 记录指向服务器 IP
2. 等待 DNS 生效

### 6.3 SSL 证书

```bash
# 获取 Let's Encrypt 证书
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 6.4 Nginx SSL 配置

在 `nginx.conf` 中添加 SSL 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... 其余配置同 nginx.conf
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 6.5 生产环境变量

创建 `.env` 文件（重要安全配置）：

```env
NODE_ENV=production
DB_PASSWORD=<强随机密码>
JWT_SECRET=<至少64字符的随机字符串>
JWT_REFRESH_SECRET=<至少64字符的随机字符串>
CLIENT_URL=https://yourdomain.com

# OAuth Keys (从各平台获取)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx

# Payment Keys
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 6.6 部署

```bash
# 部署
docker-compose -f docker-compose.yml up -d --build

# 验证
curl https://yourdomain.com/api/health
```

### 6.7 CI/CD (GitHub Actions 示例)

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/elegant-blog
            git pull origin main
            docker-compose up -d --build
```

## 7. 数据库管理

### 7.1 数据库迁移

项目使用 Sequelize ORM，模型在开发环境自动同步。生产环境建议使用迁移：

```bash
# 进入 server 目录
cd server

# 创建迁移
npx sequelize-cli migration:generate --name add-new-field

# 运行迁移
npx sequelize-cli db:migrate

# 回滚
npx sequelize-cli db:migrate:undo
```

### 7.2 数据库种子数据

```bash
# 运行种子数据（会创建默认会员计划）
npx sequelize-cli db:seed:all
```

### 7.3 直接连接数据库

```bash
# Docker 环境
docker-compose exec postgres psql -U postgres -d elegant_blog

# 常用查询
SELECT count(*) FROM users;
SELECT count(*) FROM posts WHERE status = 'published';
SELECT * FROM membership_plans;
```

## 8. 第三方服务配置

### 8.1 GitHub OAuth

1. 访问 https://github.com/settings/developers
2. 创建 "New OAuth App"
3. Homepage URL: `https://yourdomain.com`
4. Callback URL: `https://yourdomain.com/api/auth/github/callback`
5. 获取 Client ID 和 Client Secret

### 8.2 Google OAuth

1. 访问 https://console.cloud.google.com
2. 创建项目 → 启用 "Google+ API"
3. 凭据 → 创建 OAuth 2.0 客户端 ID
4. 授权重定向 URI: `https://yourdomain.com/api/auth/google/callback`

### 8.3 微信登录

1. 在 https://open.weixin.qq.com 注册开发者
2. 创建网站应用，获取 AppID 和 AppSecret
3. 设置授权回调域名

### 8.4 支付宝登录

1. 在 https://open.alipay.com 注册开发者
2. 创建应用，配置回调地址
3. 获取 App ID，配置密钥对

### 8.5 Stripe 支付

1. 注册 https://stripe.com
2. 获取 API Key (Secret Key + Publishable Key)
3. 设置 Webhook 端点: `https://yourdomain.com/api/membership/webhook/stripe`
4. Webhook Events: `checkout.session.completed`, `invoice.paid`

### 8.6 微信支付

1. 在 https://pay.weixin.qq.com 注册商户
2. 获取商户号和 API 密钥
3. 设置支付回调 URL

### 8.7 支付宝支付

1. 在 https://open.alipay.com 创建应用
2. 签约"电脑网站支付"能力
3. 配置应用公钥和私钥

## 9. 监控与日志

### 9.1 日志位置

| 日志 | 路径 | 说明 |
|------|------|------|
| 应用日志 | `server/logs/combined.log` | 所有日志 |
| 错误日志 | `server/logs/error.log` | 仅错误 |
| Nginx 日志 | `/var/log/nginx/access.log` | 访问日志 |

### 9.2 查看日志

```bash
# Docker 容器日志
docker-compose logs -f server
docker-compose logs -f client

# 应用日志
docker-compose exec server tail -f logs/combined.log
docker-compose exec server tail -f logs/error.log
```

### 9.3 健康检查

```bash
# API 健康检查
curl http://localhost:5000/api/health

# Docker 内置健康检查
docker inspect --format='{{.State.Health.Status}}' elegant-blog-server
```

### 9.4 性能监控建议

- **APM**: New Relic, Datadog, 或 PM2 Plus
- **日志聚合**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **Uptime**: UptimeRobot, Pingdom
- **服务器**: Grafana + Prometheus

## 10. 备份与恢复

### 10.1 数据库备份

```bash
# 手动备份
docker-compose exec postgres pg_dump -U postgres elegant_blog > backup_$(date +%Y%m%d).sql

# 自动备份脚本 (添加到 crontab)
# 0 2 * * * /opt/elegant-blog/scripts/backup.sh
```

创建 `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/elegant-blog"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 数据库备份
docker-compose exec -T postgres pg_dump -U postgres elegant_blog | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# 上传文件备份
tar czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /opt/elegant-blog server/uploads/

# 保留最近 30 天的备份
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 10.2 数据恢复

```bash
# 恢复数据库
gunzip < backup_20240101.sql.gz | docker-compose exec -T postgres psql -U postgres elegant_blog

# 恢复上传文件
tar xzf uploads_20240101.tar.gz -C /opt/elegant-blog/
```

## 11. 常见问题排查

### Q: 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps postgres
docker-compose logs postgres

# 检查连接
docker-compose exec postgres pg_isready
```

### Q: Redis 连接超时
```bash
# 检查 Redis
docker-compose exec redis redis-cli ping
```

### Q: 502 Bad Gateway
```bash
# 检查后端服务是否正常
docker-compose logs server
curl http://localhost:5000/api/health
```

### Q: 前端白屏
```bash
# 检查 Nginx 日志
docker-compose logs client

# 确认静态文件已构建
docker-compose exec client ls /usr/share/nginx/html
```

### Q: OAuth 回调失败
- 确认回调 URL 与 OAuth 应用配置一致
- 确认 `CLIENT_URL` 环境变量正确
- 检查第三方平台应用状态是否正常

### Q: 支付回调未收到
- 确认 webhook URL 对外可访问
- 检查防火墙是否放行
- 查看支付平台日志

## 12. 安全配置

### 12.1 安全清单

- [ ] 修改所有默认密码
- [ ] 设置强 JWT Secret（至少 64 字符随机串）
- [ ] 启用 HTTPS
- [ ] 配置防火墙（仅开放 80/443）
- [ ] 定期更新依赖 (`npm audit`)
- [ ] 设置请求速率限制（已内置 100 req/15min）
- [ ] 配置 CORS 仅允许自己的域名
- [ ] 定期备份数据库
- [ ] 监控异常登录
- [ ] 不要在代码中硬编码密钥

### 12.2 环境变量安全

```bash
# 生成随机密钥
openssl rand -hex 64

# 确保 .env 不被提交
echo ".env" >> .gitignore
```

### 12.3 更新依赖

```bash
# 检查安全漏洞
npm audit

# 自动修复
npm audit fix

# 更新依赖
npm update
```

---

## 联系与支持

- GitHub Issues: 提交 bug 和功能需求
- 文档持续更新中，欢迎贡献
