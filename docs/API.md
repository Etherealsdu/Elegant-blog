# Elegant Blog - API 文档

## Base URL
```
开发环境: http://localhost:5000/api
生产环境: https://yourdomain.com/api
```

## 认证方式
在请求 Header 中携带 JWT Token:
```
Authorization: Bearer <access_token>
```

## 统一响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

错误响应:
```json
{
  "success": false,
  "error": "错误信息",
  "details": []
}
```

---

## 1. 认证接口 `/api/auth`

### 1.1 用户注册
```
POST /api/auth/register
```

**请求体:**
```json
{
  "email": "user@example.com",
  "username": "myname",
  "password": "password123",
  "displayName": "我的名字"
}
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "username": "...", "role": "user" },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 1.2 用户登录
```
POST /api/auth/login
```

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 1.3 刷新 Token
```
POST /api/auth/refresh-token
```

**请求体:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### 1.4 获取个人资料
```
GET /api/auth/profile
Authorization: Bearer <token>
```

### 1.5 更新个人资料
```
PUT /api/auth/profile
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "displayName": "新名字",
  "bio": "个人简介",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 1.6 第三方登录
```
GET /api/auth/github       # GitHub 登录
GET /api/auth/google       # Google 登录
GET /api/auth/wechat       # 微信登录
GET /api/auth/alipay       # 支付宝登录
```
重定向到第三方授权页面，授权完成后回调到前端。

---

## 2. 文章接口 `/api/posts`

### 2.1 获取文章列表
```
GET /api/posts?page=1&pageSize=10&search=关键词&categoryId=uuid&tagId=uuid&authorId=uuid
```

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [{ "id": "...", "title": "...", "slug": "...", "excerpt": "...", "author": {...}, "tags": [...] }],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 2.2 获取文章详情（按 slug）
```
GET /api/posts/slug/:slug
```

### 2.3 获取文章详情（按 ID）
```
GET /api/posts/:id
```

### 2.4 创建文章
```
POST /api/posts
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "title": "文章标题",
  "content": "# Markdown 内容\n正文...",
  "excerpt": "摘要（可选）",
  "coverImage": "https://...",
  "categoryId": "uuid",
  "tagIds": ["uuid1", "uuid2"],
  "visibility": "public",
  "status": "published"
}
```

**visibility 可选值:** `public`, `subscribers_only`, `private`
**status 可选值:** `draft`, `published`, `archived`

### 2.5 更新文章
```
PUT /api/posts/:id
Authorization: Bearer <token>
```

### 2.6 删除文章
```
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### 2.7 点赞/取消点赞
```
POST /api/posts/:id/like
Authorization: Bearer <token>
```

---

## 3. 评论接口 `/api/comments`

### 3.1 获取文章评论
```
GET /api/comments/post/:postId?page=1&pageSize=20
```

### 3.2 发表评论
```
POST /api/comments
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "content": "评论内容",
  "postId": "uuid",
  "parentId": "uuid（可选，回复评论时使用）"
}
```

### 3.3 删除评论
```
DELETE /api/comments/:id
Authorization: Bearer <token>
```

---

## 4. 分类和标签接口

### 4.1 获取分类列表
```
GET /api/categories
```

### 4.2 创建分类（管理员）
```
POST /api/categories
Authorization: Bearer <admin_token>
```

### 4.3 获取标签列表
```
GET /api/tags
```

### 4.4 创建标签
```
POST /api/tags
Authorization: Bearer <token>
```

---

## 5. 会员接口 `/api/membership`

### 5.1 获取会员计划
```
GET /api/membership/plans
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "月度会员",
      "plan": "monthly",
      "price": 29.90,
      "currency": "CNY",
      "durationDays": 30,
      "description": "按月订阅",
      "features": ["阅读全部订阅文章", "评论互动", "无广告体验"]
    }
  ]
}
```

### 5.2 获取当前订阅
```
GET /api/membership/subscription
Authorization: Bearer <token>
```

### 5.3 订阅会员
```
POST /api/membership/subscribe
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "planId": "uuid",
  "provider": "stripe"
}
```

**provider 可选值:** `stripe`, `wechat_pay`, `alipay`

### 5.4 取消订阅
```
POST /api/membership/subscription/:id/cancel
Authorization: Bearer <token>
```

### 5.5 获取支付记录
```
GET /api/membership/payments?page=1&pageSize=10
Authorization: Bearer <token>
```

### 5.6 支付回调 Webhooks
```
POST /api/membership/webhook/stripe      # Stripe
POST /api/membership/webhook/wechat-pay  # 微信支付
POST /api/membership/webhook/alipay      # 支付宝
```

---

## 6. 文件上传 `/api/upload`

### 6.1 上传图片
```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求:**
- Field name: `image`
- 支持格式: JPEG, PNG, GIF, WebP, SVG
- 最大文件: 10MB

**响应:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/abc123.jpg",
    "filename": "abc123.jpg",
    "originalname": "photo.jpg",
    "size": 102400
  }
}
```

---

## 7. 健康检查

```
GET /api/health
```

**响应:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未认证 / Token 过期 |
| 403 | 权限不足 / 需要订阅 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱/用户名重复） |
| 429 | 请求频率限制 |
| 500 | 服务器内部错误 |
