# Elegant Blog

一个功能完备的全栈博客平台，基于 React + Node.js/Express + PostgreSQL 构建。

## 功能特性

- **Markdown 编辑器** - 带可视化工具栏，支持 GFM 语法、代码高亮、表格、任务列表等
- **用户系统** - 注册/登录 + GitHub、Google、微信、支付宝第三方认证
- **博客管理** - 文章 CRUD、分类、标签、搜索、草稿
- **评论系统** - 嵌套回复、点赞
- **分享功能** - 微信/微博/Twitter/Facebook/复制链接
- **内容可见性** - 公开、订阅专享、私密三种级别
- **会员体系** - 月/季/年订阅计划，支持 Stripe/微信支付/支付宝
- **响应式设计** - 适配桌面和移动端

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, TypeScript, Zustand, React Router 6 |
| 后端 | Node.js, Express, TypeScript, Sequelize ORM |
| 数据库 | PostgreSQL 16, Redis 7 |
| 部署 | Docker, Nginx |

## 快速开始

```bash
# 克隆项目
git clone https://github.com/Etherealsdu/Elegant-blog.git
cd Elegant-blog

# 安装依赖
npm install

# 配置环境变量
cp .env.example server/.env
# 编辑 server/.env 设置数据库连接等

# 启动开发服务器
npm run dev
```

## Docker 部署

```bash
cp .env.example .env
# 编辑 .env 设置生产环境变量
docker-compose up -d --build
```

## 项目结构

```
Elegant-blog/
├── client/              # React 前端
│   ├── src/
│   │   ├── api/         # API 请求层
│   │   ├── components/  # 通用组件
│   │   ├── pages/       # 页面组件
│   │   ├── stores/      # 状态管理
│   │   └── styles/      # 样式
├── server/              # Node.js 后端
│   ├── src/
│   │   ├── config/      # 配置
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   ├── services/    # 业务逻辑
│   │   └── __tests__/   # 测试
├── shared/              # 共享类型
├── docs/                # 文档
│   ├── DEPLOYMENT.md    # 部署运维文档
│   └── API.md           # API 接口文档
├── docker-compose.yml
└── nginx.conf
```

## 文档

- [部署与运维文档](docs/DEPLOYMENT.md) - 环境搭建、Docker 部署、生产配置、备份恢复
- [API 接口文档](docs/API.md) - 全部 REST API 接口说明

## License

MIT
