/**
 * API 路由注册中心
 *
 * 将所有模块的路由挂载到对应的路径前缀：
 * - /api/auth         - 认证相关（注册、登录、OAuth、个人资料）
 * - /api/posts        - 文章 CRUD、点赞
 * - /api/comments     - 评论管理
 * - /api/membership   - 会员订阅、支付
 * - /api/categories   - 分类管理
 * - /api/tags         - 标签管理
 * - /api/upload       - 文件上传
 * - /api/health       - 健康检查（供监控系统和负载均衡器使用）
 */
import { Router } from 'express';
import authRoutes from './auth.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';
import membershipRoutes from './membership.routes';
import categoryRoutes from './category.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/membership', membershipRoutes);
router.use('/', categoryRoutes);       // 分类和标签路由（/categories, /tags）
router.use('/upload', uploadRoutes);

// 健康检查端点：返回服务状态和时间戳
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
