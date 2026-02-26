# Elegant Blog - 部署与运维完全指南

> 本文档面向零基础用户，手把手教你从一台全新服务器开始，完成项目部署、日常运维、备份恢复和容灾处理。
> 每个步骤都附有完整命令，可以直接复制执行。

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构图解](#2-技术架构图解)
3. [环境要求](#3-环境要求)
4. [本地开发环境搭建（保姆级）](#4-本地开发环境搭建保姆级)
5. [Docker 生产部署（保姆级）](#5-docker-生产部署保姆级)
6. [HTTPS 与域名配置](#6-https-与域名配置)
7. [环境变量完全说明](#7-环境变量完全说明)
8. [第三方服务配置](#8-第三方服务配置)
9. [数据库管理](#9-数据库管理)
10. [监控与日志](#10-监控与日志)
11. [备份策略](#11-备份策略)
12. [容灾恢复手册](#12-容灾恢复手册)
13. [日常运维操作手册](#13-日常运维操作手册)
14. [安全加固清单](#14-安全加固清单)
15. [常见问题排查（FAQ）](#15-常见问题排查faq)
16. [CI/CD 自动化部署](#16-cicd-自动化部署)

---

## 1. 项目概述

Elegant Blog 是一个基于 React + Node.js 的全栈博客平台，采用 monorepo（单仓多包）架构：

```
Elegant-blog/
├── client/              # React 前端应用（用户看到的网页界面）
│   ├── src/
│   │   ├── api/         # 与后端通信的 HTTP 请求封装
│   │   ├── components/  # 可复用的 UI 组件（Header、PostCard 等）
│   │   ├── pages/       # 页面级组件（首页、登录页、编辑器等）
│   │   ├── stores/      # Zustand 状态管理（全局状态如用户登录信息）
│   │   └── styles/      # CSS 样式文件
│   └── public/          # 静态资源（HTML 模板、favicon）
├── server/              # Node.js/Express 后端 API（处理业务逻辑）
│   ├── src/
│   │   ├── config/      # 配置文件（数据库连接、环境变量读取）
│   │   ├── controllers/ # 控制器（接收请求、调用服务、返回响应）
│   │   ├── middleware/  # 中间件（认证、验证、文件上传、错误处理）
│   │   ├── models/      # Sequelize 数据模型（对应数据库表）
│   │   ├── routes/      # 路由定义（URL 与控制器的映射）
│   │   ├── services/    # 业务逻辑层（核心功能实现）
│   │   ├── utils/       # 工具函数（日志等）
│   │   └── __tests__/   # 自动化测试
│   └── logs/            # 运行时日志文件
├── shared/              # 前后端共享的 TypeScript 类型定义
├── docs/                # 项目文档
│   ├── DEPLOYMENT.md    # 本文档
│   └── API.md           # API 接口文档
├── docker-compose.yml   # Docker 编排配置（一键启动所有服务）
├── Dockerfile.server    # 后端 Docker 镜像构建文件
├── Dockerfile.client    # 前端 Docker 镜像构建文件（含 Nginx）
├── nginx.conf           # Nginx 反向代理配置
├── .env.example         # 环境变量模板
└── package.json         # 项目根配置（monorepo workspace）
```

### 核心功能

| 功能 | 说明 |
|------|------|
| Markdown 编辑器 | 所见即所得，支持 GFM 语法、代码高亮、表格、数学公式 |
| 用户系统 | 邮箱注册/登录 + GitHub/Google/微信/支付宝 OAuth 第三方登录 |
| 博客管理 | 文章增删改查、分类、标签、全文搜索、草稿/发布/归档 |
| 评论系统 | 支持嵌套回复、点赞 |
| 分享功能 | 微信/微博/Twitter/Facebook/复制链接 |
| 会员体系 | 月/季/年订阅计划，支持 Stripe/微信支付/支付宝 |
| 内容可见性 | 公开（所有人可见）/ 订阅专享（仅会员）/ 私密（仅自己） |
| 响应式设计 | 自动适配桌面和移动端 |

---

## 2. 技术架构图解

```
用户浏览器
    │
    ▼
┌─────────────────────────────────────┐
│            Nginx (端口 80/443)       │
│  - 提供 React 静态文件              │
│  - 反向代理 /api/ → 后端            │
│  - 反向代理 /uploads/ → 后端        │
│  - Gzip 压缩、安全头、缓存          │
└──────────────┬──────────────────────┘
               │ /api/*
               ▼
┌─────────────────────────────────────┐
│        Express 后端 (端口 5000)      │
│  - RESTful API                      │
│  - JWT 认证                         │
│  - 文件上传处理                     │
│  - 业务逻辑                         │
└──────┬──────────────────┬───────────┘
       │                  │
       ▼                  ▼
┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │    Redis     │
│ (端口 5432)  │  │ (端口 6379)  │
│ 主数据库     │  │ 缓存/Session │
└──────────────┘  └──────────────┘
```

### 技术栈明细

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 前端 | React | 18.x | UI 框架 |
| 前端 | TypeScript | 5.x | 类型安全 |
| 前端 | React Router | 6.x | 前端路由 |
| 前端 | Zustand | 4.x | 轻量状态管理 |
| 前端 | Axios | 1.x | HTTP 请求客户端 |
| 后端 | Node.js | 20.x LTS | JavaScript 运行时 |
| 后端 | Express | 4.x | Web 框架 |
| 后端 | Sequelize | 6.x | 数据库 ORM |
| 后端 | Passport | 0.7.x | OAuth 第三方登录 |
| 后端 | Winston | 3.x | 日志框架 |
| 数据库 | PostgreSQL | 16.x | 关系型数据库 |
| 缓存 | Redis | 7.x | 缓存与会话存储 |
| 部署 | Docker + Compose | - | 容器化编排 |
| 代理 | Nginx | - | 反向代理 + 静态服务 |

---

## 3. 环境要求

### 3.1 本地开发环境

| 软件 | 最低版本 | 用途 | 安装方式 |
|------|----------|------|----------|
| Node.js | 20.0.0 | JavaScript 运行时 | https://nodejs.org 下载 LTS 版本 |
| npm | 10.0.0 | 包管理器 | 随 Node.js 自带 |
| PostgreSQL | 14 | 数据库 | https://www.postgresql.org/download |
| Redis | 6 | 缓存 | https://redis.io/download |
| Git | 2.x | 版本控制 | https://git-scm.com |

### 3.2 生产服务器

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 磁盘 | 20 GB SSD | 50 GB SSD |
| 操作系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24.0+ | 最新稳定版 |
| Docker Compose | 2.20+ | 最新稳定版 |
| 网络 | 公网 IP | 公网 IP + 域名 + SSL |

---

## 4. 本地开发环境搭建（保姆级）

> 适合第一次接触本项目的开发者，按顺序执行即可。

### 第一步：安装基础软件

**macOS：**
```bash
# 安装 Homebrew（macOS 包管理器，如果已安装请跳过）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js 20（自带 npm）
brew install node@20

# 安装 PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# 安装 Redis
brew install redis
brew services start redis

# 验证安装
node --version    # 应显示 v20.x.x
npm --version     # 应显示 10.x.x
psql --version    # 应显示 psql (PostgreSQL) 16.x
redis-cli ping    # 应显示 PONG
```

**Ubuntu/Debian：**
```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16

# 安装 Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# 验证
node --version && npm --version && psql --version && redis-cli ping
```

**Windows：**
```
1. Node.js：访问 https://nodejs.org 下载 LTS 安装包，一路 Next 安装
2. PostgreSQL：访问 https://www.postgresql.org/download/windows/ 下载安装包
   - 安装时记住设置的 postgres 用户密码
3. Redis：访问 https://github.com/tporadowski/redis/releases 下载安装包
4. Git：访问 https://git-scm.com/download/win 下载安装包
5. 安装完成后，在 PowerShell 或 Git Bash 中验证：
   node --version
   npm --version
```

### 第二步：克隆项目并安装依赖

```bash
# 克隆项目代码
git clone https://github.com/Etherealsdu/Elegant-blog.git
cd Elegant-blog

# 安装所有依赖（monorepo 会同时安装 client/server/shared 的依赖）
npm install

# 如果 npm install 报错，尝试清除缓存后重试：
# npm cache clean --force
# rm -rf node_modules
# npm install
```

### 第三步：创建数据库

```bash
# macOS / Linux：连接 PostgreSQL
psql -U postgres

# Windows：使用 pgAdmin 图形工具，或在 SQL Shell (psql) 中操作
```

在 psql 中执行：
```sql
-- 创建项目专用数据库
CREATE DATABASE elegant_blog;

-- 验证数据库已创建
\l

-- 退出 psql
\q
```

### 第四步：配置环境变量

```bash
# 复制环境变量模板
cp .env.example server/.env
```

用任意文本编辑器打开 `server/.env`，修改以下内容：

```env
# 基础配置（一般不需要改动）
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# 数据库连接（如果你在安装 PostgreSQL 时设置了其他密码，请替换 password）
DATABASE_URL=postgresql://postgres:password@localhost:5432/elegant_blog

# Redis 连接（一般不需要改动）
REDIS_URL=redis://localhost:6379

# JWT 密钥（开发环境可以用默认值，生产环境必须改！）
JWT_SECRET=my-dev-secret-key-at-least-32-characters-long
JWT_REFRESH_SECRET=my-dev-refresh-secret-key-also-long

# 以下第三方配置在本地开发时可以暂时不填（对应功能不可用而已）
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# ...
```

### 第五步：启动开发服务器

```bash
# 方式一：同时启动前后端（推荐）
npm run dev

# 方式二：分别启动（适合需要单独调试时使用）
# 终端 1 - 启动后端
npm run dev:server

# 终端 2 - 启动前端
npm run dev:client
```

启动成功后：
- 前端地址：http://localhost:3000 （浏览器自动打开）
- 后端 API：http://localhost:5000/api
- 健康检查：http://localhost:5000/api/health

### 第六步：验证一切正常

```bash
# 1. 检查后端 API 健康
curl http://localhost:5000/api/health
# 应返回：{"success":true,"data":{"status":"ok","timestamp":"..."}}

# 2. 用浏览器打开 http://localhost:3000
#    应该看到 Elegant Blog 首页

# 3. 尝试注册一个账号，验证数据库读写正常
```

### 第七步：运行测试

```bash
# 运行所有测试
npm test

# 仅运行后端测试
npm run test:server

# 仅运行前端测试
npm run test:client
```

---

## 5. Docker 生产部署（保姆级）

> 适合在全新服务器上从零部署生产环境。

### 第一步：准备服务器

以 Ubuntu 22.04 为例，SSH 登录到服务器后执行：

```bash
# 更新系统软件包
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git vim ufw

# 配置防火墙（仅开放必要端口）
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw --force enable
sudo ufw status           # 确认规则已生效
```

### 第二步：安装 Docker

```bash
# 一键安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户加入 docker 组（免 sudo 运行 docker 命令）
sudo usermod -aG docker $USER

# !!! 重要：需要重新登录 SSH 才能生效 !!!
exit
# 重新 SSH 登录后验证：
docker --version          # 应显示 Docker version 24.x+
docker compose version    # 应显示 Docker Compose version v2.x+
```

### 第三步：获取项目代码

```bash
# 创建项目目录
sudo mkdir -p /opt/elegant-blog
sudo chown $USER:$USER /opt/elegant-blog
cd /opt/elegant-blog

# 克隆项目
git clone https://github.com/Etherealsdu/Elegant-blog.git .
```

### 第四步：配置环境变量

```bash
# 从模板创建 .env 文件
cp .env.example .env
```

**编辑 `.env` 文件（这是最关键的一步！）：**

```bash
vim .env
# 或使用 nano .env（nano 对新手更友好）
```

**必须修改的配置项：**

```env
# 数据库密码（务必改为强随机密码！）
DB_PASSWORD=这里换成一个随机强密码比如Abc123xyz456

# JWT 密钥（务必改为至少 64 字符的随机字符串！）
# 生成方法：在终端执行 openssl rand -hex 64
JWT_SECRET=在终端执行openssl_rand_hex_64生成的随机字符串粘贴到这里
JWT_REFRESH_SECRET=再执行一次openssl_rand_hex_64生成另一个随机字符串

# 前端地址（替换为你的域名，如果还没有域名先用服务器 IP）
CLIENT_URL=http://你的服务器IP

# 以下为第三方服务配置，按需填写（不用的可以不填）
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# STRIPE_SECRET_KEY=
```

**快速生成随机密钥的命令：**

```bash
# 生成 JWT_SECRET
echo "JWT_SECRET=$(openssl rand -hex 64)"

# 生成 JWT_REFRESH_SECRET
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 64)"

# 生成 DB_PASSWORD
echo "DB_PASSWORD=$(openssl rand -base64 24)"
```

### 第五步：构建并启动所有服务

```bash
cd /opt/elegant-blog

# 构建镜像并启动（首次构建需要 5-15 分钟，取决于网络速度）
docker compose up -d --build

# 查看构建日志（如果构建失败请查看此输出找错误原因）
docker compose logs -f
# 按 Ctrl+C 退出日志查看
```

### 第六步：验证部署成功

```bash
# 1. 查看所有服务状态（应全部显示 Up 和 healthy）
docker compose ps

# 预期输出类似：
# NAME                    STATUS              PORTS
# elegant-blog-client     Up                  0.0.0.0:80->80/tcp
# elegant-blog-db         Up (healthy)        0.0.0.0:5432->5432/tcp
# elegant-blog-redis      Up (healthy)        0.0.0.0:6379->6379/tcp
# elegant-blog-server     Up (healthy)        0.0.0.0:5000->5000/tcp

# 2. 检查 API 健康
curl http://localhost/api/health
# 应返回：{"success":true,"data":{"status":"ok","timestamp":"..."}}

# 3. 用浏览器访问
# http://你的服务器IP
```

### 第七步：首次部署后的安全操作

```bash
# 1. 移除数据库和 Redis 的外部端口暴露（生产环境不应直接暴露）
#    编辑 docker-compose.yml，将 postgres 和 redis 的 ports 配置注释掉或删除
#    （它们只需要在 Docker 内部网络中通信）

# 2. 注册第一个管理员账号
#    访问 http://你的域名/register 注册
#    然后在数据库中将该用户角色设为 admin：
docker compose exec postgres psql -U postgres -d elegant_blog \
  -c "UPDATE users SET role = 'admin' WHERE email = '你的邮箱';"
```

---

## 6. HTTPS 与域名配置

> HTTPS 是生产环境的必需配置，可以保护用户数据传输安全。

### 6.1 域名解析

1. 登录你的域名服务商控制台（如阿里云、腾讯云、Cloudflare 等）
2. 添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| A | @ | 你的服务器公网IP | 600 |
| A | www | 你的服务器公网IP | 600 |

3. 等待 DNS 生效（通常 5-30 分钟）

```bash
# 验证 DNS 是否生效
ping yourdomain.com
# 应显示你的服务器 IP
```

### 6.2 申请免费 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot

# 先停止 Nginx（因为 Certbot 需要用 80 端口验证）
docker compose stop client

# 申请证书（替换 yourdomain.com 为你的域名）
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# 证书文件位置：
# 证书：/etc/letsencrypt/live/yourdomain.com/fullchain.pem
# 私钥：/etc/letsencrypt/live/yourdomain.com/privkey.pem

# 重新启动
docker compose start client
```

### 6.3 配置 Nginx SSL

创建 `nginx-ssl.conf` 文件（或修改现有的 `nginx.conf`）：

```nginx
# HTTP -> HTTPS 自动跳转
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书路径（在 docker-compose.yml 中挂载到容器内）
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS（强制浏览器使用 HTTPS）
    add_header Strict-Transport-Security "max-age=63072000" always;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API 反向代理
    location /api/ {
        proxy_pass http://server:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 上传文件代理
    location /uploads/ {
        proxy_pass http://server:5000/uploads/;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 健康检查
    location /health {
        access_log off;
        default_type text/plain;
        return 200 "healthy\n";
    }
}
```

在 `docker-compose.yml` 的 `client` 服务中挂载证书：

```yaml
  client:
    # ... 其他配置不变
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro   # 挂载 SSL 证书（只读）
```

更新 `.env` 中的前端地址：

```env
CLIENT_URL=https://yourdomain.com
```

重新构建并重启：

```bash
docker compose up -d --build client
```

### 6.4 SSL 证书自动续期

Let's Encrypt 证书有效期为 90 天，需要设置自动续期：

```bash
# 测试续期命令是否正常（不会真正续期）
sudo certbot renew --dry-run

# 设置定时任务自动续期
sudo crontab -e
```

添加以下行（每天凌晨 3 点检查并续期，续期后重启 Nginx）：

```
0 3 * * * certbot renew --quiet --post-hook "docker compose -f /opt/elegant-blog/docker-compose.yml restart client"
```

---

## 7. 环境变量完全说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | 否 | development | 运行环境：development / production |
| `PORT` | 否 | 5000 | 后端服务端口 |
| `CLIENT_URL` | 是 | http://localhost:3000 | 前端地址，用于 CORS 和 OAuth 回调 |
| `DATABASE_URL` | 是 | - | PostgreSQL 连接字符串 |
| `REDIS_URL` | 是 | redis://localhost:6379 | Redis 连接地址 |
| `DB_PASSWORD` | 是 | postgres123 | Docker 环境下的数据库密码 |
| `JWT_SECRET` | 是 | - | Access Token 签名密钥（至少 64 字符） |
| `JWT_REFRESH_SECRET` | 是 | - | Refresh Token 签名密钥（至少 64 字符） |
| `JWT_EXPIRES_IN` | 否 | 7d | Access Token 过期时间 |
| `JWT_REFRESH_EXPIRES_IN` | 否 | 30d | Refresh Token 过期时间 |
| `GITHUB_CLIENT_ID` | 否 | - | GitHub OAuth 应用 ID |
| `GITHUB_CLIENT_SECRET` | 否 | - | GitHub OAuth 密钥 |
| `GOOGLE_CLIENT_ID` | 否 | - | Google OAuth 应用 ID |
| `GOOGLE_CLIENT_SECRET` | 否 | - | Google OAuth 密钥 |
| `WECHAT_APP_ID` | 否 | - | 微信开放平台应用 ID |
| `WECHAT_APP_SECRET` | 否 | - | 微信开放平台密钥 |
| `ALIPAY_APP_ID` | 否 | - | 支付宝应用 ID |
| `ALIPAY_PRIVATE_KEY` | 否 | - | 支付宝应用私钥 |
| `STRIPE_SECRET_KEY` | 否 | - | Stripe 支付密钥 |
| `STRIPE_WEBHOOK_SECRET` | 否 | - | Stripe Webhook 验证密钥 |
| `UPLOAD_DIR` | 否 | uploads | 文件上传目录 |
| `MAX_FILE_SIZE` | 否 | 10485760 | 最大上传文件大小（字节，默认 10MB） |
| `SMTP_HOST` | 否 | smtp.gmail.com | 邮件服务器 |
| `SMTP_PORT` | 否 | 587 | 邮件端口 |
| `SMTP_USER` | 否 | - | 邮箱账号 |
| `SMTP_PASS` | 否 | - | 邮箱密码或授权码 |

---

## 8. 第三方服务配置

### 8.1 GitHub OAuth 登录

1. 打开 https://github.com/settings/developers
2. 点击 **New OAuth App**
3. 填写信息：
   - Application name: `Elegant Blog`
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/github/callback`
4. 创建后获取 **Client ID** 和 **Client Secret**
5. 填入 `.env` 文件：
   ```env
   GITHUB_CLIENT_ID=获取到的Client_ID
   GITHUB_CLIENT_SECRET=获取到的Client_Secret
   GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
   ```

### 8.2 Google OAuth 登录

1. 打开 https://console.cloud.google.com
2. 创建新项目（或选择已有项目）
3. 左侧菜单 → API 和服务 → 凭据 → 创建凭据 → OAuth 客户端 ID
4. 应用类型选择 **Web 应用**
5. 授权重定向 URI 添加：`https://yourdomain.com/api/auth/google/callback`
6. 获取 Client ID 和 Client Secret 填入 `.env`

### 8.3 微信登录

1. 注册微信开放平台：https://open.weixin.qq.com
2. 创建"网站应用"
3. 通过审核后获取 AppID 和 AppSecret
4. 设置授权回调域名为 `yourdomain.com`

### 8.4 Stripe 支付

1. 注册 https://stripe.com
2. 在 Dashboard → Developers → API keys 获取密钥
3. 设置 Webhook：
   - 端点 URL：`https://yourdomain.com/api/membership/webhook/stripe`
   - 监听事件：`checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`

---

## 9. 数据库管理

### 9.1 连接数据库

```bash
# Docker 环境下连接 PostgreSQL
docker compose exec postgres psql -U postgres -d elegant_blog

# 常用 psql 命令：
# \dt        -- 列出所有表
# \d users   -- 查看 users 表结构
# \q         -- 退出
```

### 9.2 常用数据查询

```sql
-- 查看用户数量
SELECT count(*) FROM users;

-- 查看已发布文章数
SELECT count(*) FROM posts WHERE status = 'published';

-- 查看会员计划
SELECT * FROM membership_plans;

-- 查看活跃订阅
SELECT u.email, s.status, s.end_date
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active';

-- 将某用户设为管理员
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 9.3 数据库迁移（生产环境推荐）

```bash
cd server

# 创建迁移文件
npx sequelize-cli migration:generate --name add-new-field

# 执行所有未运行的迁移
npx sequelize-cli db:migrate

# 回滚上一次迁移
npx sequelize-cli db:migrate:undo

# 回滚所有迁移
npx sequelize-cli db:migrate:undo:all
```

---

## 10. 监控与日志

### 10.1 日志位置一览

| 日志类型 | Docker 内路径 | 宿主机查看方式 | 内容 |
|----------|---------------|----------------|------|
| 应用全量日志 | `/app/server/logs/combined.log` | `docker compose exec server cat logs/combined.log` | 所有级别的日志 |
| 错误日志 | `/app/server/logs/error.log` | `docker compose exec server cat logs/error.log` | 仅 error 级别 |
| Nginx 访问日志 | `/var/log/nginx/access.log` | `docker compose exec client cat /var/log/nginx/access.log` | HTTP 请求记录 |
| Docker 容器日志 | - | `docker compose logs <服务名>` | 容器标准输出 |

### 10.2 实时查看日志

```bash
# 查看所有服务日志（实时跟踪）
docker compose logs -f

# 只看后端日志
docker compose logs -f server

# 只看最近 100 行后端日志
docker compose logs --tail=100 server

# 查看应用错误日志
docker compose exec server tail -f logs/error.log
```

### 10.3 健康检查

```bash
# API 健康检查
curl -s http://localhost/api/health | python3 -m json.tool

# 数据库健康检查
docker compose exec postgres pg_isready -U postgres

# Redis 健康检查
docker compose exec redis redis-cli ping

# 查看各容器健康状态
docker compose ps

# 查看单个容器详细健康信息
docker inspect --format='{{json .State.Health}}' elegant-blog-server | python3 -m json.tool
```

### 10.4 磁盘空间监控

```bash
# 查看服务器磁盘使用
df -h

# 查看 Docker 磁盘使用
docker system df

# 清理无用的 Docker 镜像和缓存（释放磁盘空间）
docker system prune -f
docker image prune -f
```

---

## 11. 备份策略

> 数据是最重要的资产！请务必配置自动备份。

### 11.1 需要备份的数据

| 数据 | 重要性 | 备份方式 | 说明 |
|------|--------|----------|------|
| PostgreSQL 数据库 | **最高** | pg_dump | 用户、文章、评论、订阅等所有业务数据 |
| 上传文件（uploads/） | 高 | tar 打包 | 用户上传的图片等 |
| .env 环境变量文件 | 高 | 手动复制 | 密钥和配置 |
| nginx.conf | 中 | Git 管理 | Nginx 配置 |
| SSL 证书 | 中 | 复制 /etc/letsencrypt | HTTPS 证书 |

### 11.2 手动备份

```bash
# ===== 数据库备份 =====
# 导出完整数据库为 SQL 文件
docker compose exec -T postgres pg_dump -U postgres elegant_blog > backup_db_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份文件（推荐，可减小 80%+ 体积）
docker compose exec -T postgres pg_dump -U postgres elegant_blog | gzip > backup_db_$(date +%Y%m%d_%H%M%S).sql.gz

# ===== 上传文件备份 =====
# 从 Docker volume 复制出来
docker compose cp server:/app/server/uploads ./backup_uploads_$(date +%Y%m%d_%H%M%S)

# 或者打包压缩
docker compose exec -T server tar czf - uploads/ > backup_uploads_$(date +%Y%m%d_%H%M%S).tar.gz

# ===== 环境变量备份 =====
cp .env .env.backup_$(date +%Y%m%d)
```

### 11.3 自动备份脚本

创建 `/opt/elegant-blog/scripts/backup.sh`：

```bash
#!/bin/bash
# ============================================
# Elegant Blog 自动备份脚本
#
# 功能：
# 1. 备份 PostgreSQL 数据库（gzip 压缩）
# 2. 备份用户上传文件
# 3. 自动清理超过 30 天的旧备份
# 4. 可选：上传到远程存储（阿里云 OSS / AWS S3）
#
# 使用方法：
#   chmod +x /opt/elegant-blog/scripts/backup.sh
#   /opt/elegant-blog/scripts/backup.sh
#
# 定时任务（crontab -e 添加）：
#   0 2 * * * /opt/elegant-blog/scripts/backup.sh >> /var/log/elegant-blog-backup.log 2>&1
# ============================================

set -e  # 遇到错误立即退出

# ----- 配置 -----
PROJECT_DIR="/opt/elegant-blog"
BACKUP_DIR="/opt/backups/elegant-blog"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30   # 保留最近 30 天的备份

# ----- 创建备份目录 -----
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "开始备份 - $DATE"
echo "=========================================="

# ----- 1. 数据库备份 -----
echo "[1/3] 备份数据库..."
cd "$PROJECT_DIR"
docker compose exec -T postgres pg_dump -U postgres --clean --if-exists elegant_blog \
  | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"
DB_SIZE=$(ls -lh "$BACKUP_DIR/db_$DATE.sql.gz" | awk '{print $5}')
echo "  数据库备份完成：db_$DATE.sql.gz ($DB_SIZE)"

# ----- 2. 上传文件备份 -----
echo "[2/3] 备份上传文件..."
docker compose exec -T server tar czf - uploads/ > "$BACKUP_DIR/uploads_$DATE.tar.gz" 2>/dev/null || true
UPLOAD_SIZE=$(ls -lh "$BACKUP_DIR/uploads_$DATE.tar.gz" 2>/dev/null | awk '{print $5}')
echo "  上传文件备份完成：uploads_$DATE.tar.gz ($UPLOAD_SIZE)"

# ----- 3. 清理旧备份 -----
echo "[3/3] 清理 ${RETENTION_DAYS} 天前的旧备份..."
DELETED=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "  已删除 $DELETED 个旧备份文件"

# ----- 完成 -----
echo ""
echo "备份完成！文件位于：$BACKUP_DIR"
ls -lh "$BACKUP_DIR"/db_$DATE* "$BACKUP_DIR"/uploads_$DATE* 2>/dev/null
echo ""
echo "当前备份目录总大小：$(du -sh $BACKUP_DIR | awk '{print $1}')"
echo "=========================================="
```

设置权限和定时任务：

```bash
# 赋予执行权限
chmod +x /opt/elegant-blog/scripts/backup.sh

# 手动运行一次测试
/opt/elegant-blog/scripts/backup.sh

# 设置每天凌晨 2 点自动备份
crontab -e
```

添加以下行：

```
0 2 * * * /opt/elegant-blog/scripts/backup.sh >> /var/log/elegant-blog-backup.log 2>&1
```

### 11.4 异地备份（强烈推荐）

本地备份只能防止误操作，不能防止服务器硬件故障。建议将备份同步到异地存储。

**方式 A：SCP 到另一台服务器**

```bash
# 在备份脚本末尾添加：
scp "$BACKUP_DIR/db_$DATE.sql.gz" user@backup-server:/backups/elegant-blog/
```

**方式 B：上传到阿里云 OSS**

```bash
# 安装 ossutil
wget https://gosspublic.alicdn.com/ossutil/1.7.18/ossutil-v1.7.18-linux-amd64.zip
unzip ossutil-v1.7.18-linux-amd64.zip
sudo cp ossutil-v1.7.18-linux-amd64/ossutil64 /usr/local/bin/ossutil

# 配置（需要 AccessKey）
ossutil config

# 在备份脚本末尾添加：
ossutil cp "$BACKUP_DIR/db_$DATE.sql.gz" oss://your-bucket/elegant-blog-backups/
```

**方式 C：上传到 AWS S3**

```bash
# 安装 AWS CLI
sudo apt install -y awscli
aws configure

# 在备份脚本末尾添加：
aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://your-bucket/elegant-blog-backups/
```

---

## 12. 容灾恢复手册

> 本章覆盖各种灾难场景的恢复步骤。
> 建议打印此章节并存放在安全位置，紧急时可以离线参考。

### 12.1 场景一：单个容器崩溃

**症状：** 网站部分功能不可用，`docker compose ps` 显示某个服务状态异常。

**恢复步骤：**

```bash
cd /opt/elegant-blog

# 1. 查看哪个服务出问题
docker compose ps

# 2. 查看崩溃服务的日志，了解原因
docker compose logs --tail=100 <服务名>
# 例如：docker compose logs --tail=100 server

# 3. 重启该服务
docker compose restart <服务名>

# 4. 如果重启无效，重建容器
docker compose up -d --force-recreate <服务名>

# 5. 验证恢复
docker compose ps
curl http://localhost/api/health
```

**预计恢复时间：** 1-5 分钟

---

### 12.2 场景二：数据库数据损坏 / 误删数据

**症状：** 数据丢失，API 返回数据异常。

**恢复步骤：**

```bash
cd /opt/elegant-blog

# 1. 立即停止后端服务，防止继续写入损坏数据
docker compose stop server

# 2. 找到最近的备份文件
ls -lt /opt/backups/elegant-blog/db_*.sql.gz | head -5

# 3. 删除并重建数据库
docker compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS elegant_blog;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE elegant_blog;"

# 4. 恢复数据库（替换文件名为实际的备份文件）
gunzip < /opt/backups/elegant-blog/db_20240101_020000.sql.gz \
  | docker compose exec -T postgres psql -U postgres -d elegant_blog

# 5. 重新启动后端服务
docker compose start server

# 6. 验证数据恢复
docker compose exec postgres psql -U postgres -d elegant_blog \
  -c "SELECT count(*) FROM users; SELECT count(*) FROM posts;"

# 7. 检查服务是否正常
curl http://localhost/api/health
```

**预计恢复时间：** 5-30 分钟（取决于数据量）

---

### 12.3 场景三：服务器磁盘已满

**症状：** 服务无法启动，日志写入失败，数据库报错。

**恢复步骤：**

```bash
# 1. 查看磁盘使用情况
df -h

# 2. 查找大文件
sudo du -sh /var/lib/docker/*
sudo du -sh /opt/elegant-blog/server/logs/*
sudo du -sh /opt/backups/*

# 3. 清理 Docker 无用数据（安全操作，不会删除运行中的容器数据）
docker system prune -f
docker image prune -a -f    # 删除所有未使用的镜像

# 4. 清理旧日志
docker compose exec server sh -c "cat /dev/null > logs/combined.log"

# 5. 清理旧备份（保留最近 7 天）
find /opt/backups -mtime +7 -delete

# 6. 如果还不够，考虑扩容磁盘或迁移数据

# 7. 重启服务
docker compose restart
```

**预计恢复时间：** 5-15 分钟

---

### 12.4 场景四：整台服务器宕机（需要在新服务器恢复）

**症状：** 原服务器完全不可访问，需要在新服务器上从备份恢复整个服务。

**前提：** 你有数据库备份文件和上传文件备份（存放在异地存储中）。

**在新服务器上执行：**

```bash
# ===== 第一阶段：环境准备（约 10 分钟）=====

# 1. 安装 Docker（同第 5 章第二步）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# 重新登录 SSH

# 2. 获取项目代码
sudo mkdir -p /opt/elegant-blog
sudo chown $USER:$USER /opt/elegant-blog
cd /opt/elegant-blog
git clone https://github.com/Etherealsdu/Elegant-blog.git .

# ===== 第二阶段：恢复配置（约 5 分钟）=====

# 3. 恢复 .env 文件（从备份恢复，或手动重新创建）
# 如果有备份：
cp /path/to/backup/.env .env
# 如果没有备份，参考第 5 章第四步重新创建

# 4. 更新 DNS：将域名 A 记录指向新服务器 IP
# （在域名服务商控制台操作）

# ===== 第三阶段：启动服务（约 10 分钟）=====

# 5. 构建并启动所有服务
docker compose up -d --build

# 等待所有服务启动完成
sleep 30
docker compose ps   # 确认全部 Up

# ===== 第四阶段：恢复数据（约 5-30 分钟）=====

# 6. 从异地备份下载数据库备份文件
# SCP 方式：
scp user@backup-server:/backups/elegant-blog/db_latest.sql.gz /tmp/
# 或 OSS：
# ossutil cp oss://your-bucket/elegant-blog-backups/db_latest.sql.gz /tmp/
# 或 S3：
# aws s3 cp s3://your-bucket/elegant-blog-backups/db_latest.sql.gz /tmp/

# 7. 恢复数据库
docker compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS elegant_blog;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE elegant_blog;"
gunzip < /tmp/db_latest.sql.gz \
  | docker compose exec -T postgres psql -U postgres -d elegant_blog

# 8. 恢复上传文件（如果有备份）
# docker compose cp /tmp/backup_uploads/uploads server:/app/server/
# 或：
# tar xzf /tmp/uploads_latest.tar.gz
# docker compose cp uploads server:/app/server/

# 9. 重启后端让 Sequelize 同步模型
docker compose restart server

# ===== 第五阶段：验证（约 5 分钟）=====

# 10. 全面验证
curl http://localhost/api/health
docker compose exec postgres psql -U postgres -d elegant_blog \
  -c "SELECT count(*) as users FROM users; SELECT count(*) as posts FROM posts;"

# 11. 如果配置了 SSL，重新申请证书
sudo certbot certonly --standalone -d yourdomain.com
docker compose restart client
```

**预计恢复时间：** 30-60 分钟

---

### 12.5 场景五：数据库密码泄露 / 被入侵

**症状：** 发现数据库被非法访问。

**紧急响应步骤：**

```bash
cd /opt/elegant-blog

# 1. 立即断开外部数据库访问
# 如果数据库端口暴露了，先通过防火墙封禁
sudo ufw deny 5432

# 2. 生成新密码
NEW_DB_PASS=$(openssl rand -base64 24)
echo "新数据库密码: $NEW_DB_PASS"

# 3. 修改数据库密码
docker compose exec postgres psql -U postgres \
  -c "ALTER USER postgres PASSWORD '$NEW_DB_PASS';"

# 4. 更新 .env 文件中的 DB_PASSWORD
vim .env   # 将 DB_PASSWORD 更新为新密码

# 5. 同时更新 JWT 密钥（因为旧 Token 可能已被窃取）
NEW_JWT=$(openssl rand -hex 64)
NEW_JWT_REFRESH=$(openssl rand -hex 64)
echo "新 JWT_SECRET: $NEW_JWT"
echo "新 JWT_REFRESH_SECRET: $NEW_JWT_REFRESH"
# 更新 .env 中对应的值

# 6. 重启所有服务使新配置生效
docker compose up -d --force-recreate

# 7. 所有用户的登录状态会失效（需要重新登录），这是预期行为

# 8. 检查数据库是否有可疑操作
docker compose exec postgres psql -U postgres -d elegant_blog \
  -c "SELECT * FROM users WHERE role = 'admin';"
# 确认没有被注入的管理员账号

# 9. 审计日志
docker compose exec server cat logs/combined.log | grep -i "error\|unauthorized\|forbidden"
```

---

### 12.6 场景六：Docker Volume 数据丢失

**症状：** 执行了 `docker compose down -v` 或磁盘故障导致 Volume 数据丢失。

```bash
# 这相当于"数据库数据损坏"场景，按 12.2 恢复数据库
# 加上恢复上传文件

# 1. 重新启动服务（会创建新的空数据库）
docker compose up -d

# 2. 等待服务启动
sleep 20

# 3. 恢复数据库
gunzip < /opt/backups/elegant-blog/db_latest.sql.gz \
  | docker compose exec -T postgres psql -U postgres -d elegant_blog

# 4. 恢复上传文件
tar xzf /opt/backups/elegant-blog/uploads_latest.tar.gz -C /tmp/
docker compose cp /tmp/uploads server:/app/server/

# 5. 重启
docker compose restart server
```

---

### 12.7 容灾恢复检查清单

定期（建议每月一次）执行以下检查，确保灾难发生时能够快速恢复：

- [ ] 自动备份脚本正常运行（检查 `/var/log/elegant-blog-backup.log`）
- [ ] 备份文件存在且大小合理（`ls -lh /opt/backups/elegant-blog/`）
- [ ] 异地备份同步正常（检查远程存储中的文件日期）
- [ ] **模拟恢复测试**：在测试环境中用备份文件恢复一次，确认数据完整
- [ ] .env 文件有异地备份
- [ ] SSL 证书未过期（`sudo certbot certificates`）
- [ ] 服务器磁盘空间充足（`df -h`，建议保持 30% 以上可用）
- [ ] 所有容器运行正常（`docker compose ps`）

---

## 13. 日常运维操作手册

### 13.1 更新代码部署

```bash
cd /opt/elegant-blog

# 1. 备份当前数据库（重要！更新前必须备份）
docker compose exec -T postgres pg_dump -U postgres elegant_blog \
  | gzip > /opt/backups/elegant-blog/db_before_update_$(date +%Y%m%d_%H%M%S).sql.gz

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建并重启
docker compose up -d --build

# 4. 查看日志确认无错误
docker compose logs --tail=50 server

# 5. 验证
curl http://localhost/api/health
```

### 13.2 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启单个服务
docker compose restart server   # 后端
docker compose restart client   # 前端/Nginx
docker compose restart postgres # 数据库（谨慎！会中断连接）
docker compose restart redis    # Redis
```

### 13.3 查看资源使用

```bash
# 查看容器 CPU / 内存使用率
docker stats --no-stream

# 查看磁盘使用
df -h
docker system df
```

### 13.4 清理磁盘空间

```bash
# 清理 Docker 构建缓存
docker builder prune -f

# 清理无用镜像
docker image prune -a -f

# 清理旧日志（保留最近 7 天）
docker compose exec server find logs/ -name "*.log" -mtime +7 -delete

# 查看清理效果
docker system df
df -h
```

### 13.5 数据库维护

```bash
# 分析和优化表（建议每周执行一次）
docker compose exec postgres psql -U postgres -d elegant_blog -c "VACUUM ANALYZE;"

# 查看数据库大小
docker compose exec postgres psql -U postgres -d elegant_blog \
  -c "SELECT pg_size_pretty(pg_database_size('elegant_blog'));"

# 查看各表大小
docker compose exec postgres psql -U postgres -d elegant_blog \
  -c "SELECT relname AS table, pg_size_pretty(pg_total_relation_size(relid)) AS size
      FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

---

## 14. 安全加固清单

### 上线前必须完成

- [ ] **修改所有默认密码**：数据库密码、JWT 密钥
- [ ] **启用 HTTPS**：配置 SSL 证书
- [ ] **配置防火墙**：仅开放 22（SSH）、80（HTTP）、443（HTTPS）
- [ ] **禁止外部访问数据库**：移除 docker-compose.yml 中 postgres 和 redis 的 ports
- [ ] **配置 CORS**：`.env` 中 `CLIENT_URL` 设置为实际域名
- [ ] **.env 文件权限**：`chmod 600 .env`
- [ ] **SSH 禁用密码登录**：使用密钥认证

### 定期维护

- [ ] 每月检查依赖安全漏洞：`npm audit`
- [ ] 每月检查系统安全更新：`sudo apt update && sudo apt upgrade`
- [ ] 每月验证备份有效性
- [ ] 每 90 天检查 SSL 证书续期
- [ ] 定期审查管理员账号列表

### 密钥生成命令速查

```bash
# 生成数据库密码（24 字节 base64）
openssl rand -base64 24

# 生成 JWT 密钥（64 字节 hex = 128 字符）
openssl rand -hex 64

# 生成通用随机字符串（32 字节）
openssl rand -hex 32
```

---

## 15. 常见问题排查（FAQ）

### Q1: `docker compose up` 报错 "port is already allocated"

**原因：** 端口被其他程序占用。

```bash
# 查看谁在用这个端口（以 5432 为例）
sudo lsof -i :5432
# 或
sudo netstat -tlnp | grep 5432

# 停止占用端口的程序，或修改 docker-compose.yml 中的端口映射
```

### Q2: 数据库连接失败 "ECONNREFUSED"

```bash
# 1. 检查数据库容器是否运行
docker compose ps postgres

# 2. 查看数据库日志
docker compose logs postgres

# 3. 检查数据库健康状态
docker compose exec postgres pg_isready -U postgres

# 4. 检查 DATABASE_URL 是否正确（Docker 内部用服务名 postgres，不是 localhost）
# Docker 内：postgresql://postgres:password@postgres:5432/elegant_blog
# 本地开发：postgresql://postgres:password@localhost:5432/elegant_blog
```

### Q3: Redis 连接超时

```bash
docker compose exec redis redis-cli ping
# 应返回 PONG

# 如果无响应，重启 Redis
docker compose restart redis
```

### Q4: 502 Bad Gateway

**原因：** Nginx 无法连接到后端服务。

```bash
# 检查后端服务是否运行
docker compose ps server
docker compose logs --tail=50 server

# 尝试直接访问后端
curl http://localhost:5000/api/health

# 重启后端
docker compose restart server
```

### Q5: 前端页面白屏

```bash
# 1. 检查 Nginx 是否运行
docker compose ps client

# 2. 检查 React 构建产物是否存在
docker compose exec client ls /usr/share/nginx/html/

# 3. 查看 Nginx 错误日志
docker compose logs client

# 4. 重新构建前端
docker compose up -d --build client
```

### Q6: OAuth 登录回调失败

1. 检查 `.env` 中 `CLIENT_URL` 是否与浏览器访问的地址一致（包括 http/https）
2. 检查 OAuth 应用配置的回调 URL 是否正确
3. 检查后端日志：`docker compose logs --tail=50 server`

### Q7: 上传图片失败

```bash
# 检查上传目录是否存在且有写权限
docker compose exec server ls -la uploads/

# 检查磁盘空间
df -h

# 检查文件大小限制（默认 10MB）
# 可在 .env 中修改 MAX_FILE_SIZE
```

### Q8: 构建镜像速度很慢

```bash
# 使用国内 npm 镜像加速（在 Dockerfile 中添加）
# RUN npm config set registry https://registry.npmmirror.com

# 使用 Docker 构建缓存
docker compose build --parallel
```

---

## 16. CI/CD 自动化部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/elegant-blog

            # 部署前备份
            docker compose exec -T postgres pg_dump -U postgres elegant_blog \
              | gzip > /opt/backups/elegant-blog/db_predeploy_$(date +%Y%m%d_%H%M%S).sql.gz

            # 拉取最新代码
            git pull origin main

            # 重新构建并部署
            docker compose up -d --build

            # 等待服务启动
            sleep 15

            # 健康检查
            curl -f http://localhost/api/health || exit 1

            echo "Deploy successful!"
```

在 GitHub 仓库的 Settings → Secrets 中添加：
- `SERVER_HOST`：服务器 IP
- `SERVER_USER`：SSH 用户名
- `SSH_PRIVATE_KEY`：SSH 私钥

---

## 联系与支持

- **GitHub Issues**: 提交 Bug 和功能需求
- **API 文档**: 参见 [docs/API.md](./API.md)
- 文档持续更新中，欢迎贡献改进
