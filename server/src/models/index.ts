/**
 * 模型关联关系定义
 *
 * 此文件导入所有 Sequelize 模型，并定义它们之间的关联关系。
 * Sequelize 需要在此统一定义关联，确保 include 查询时能正确工作。
 *
 * 关联关系概览：
 * - User 1:N Post（作者与文章）
 * - Category 1:N Post（分类与文章）
 * - Category 自引用（父分类/子分类）
 * - Post N:M Tag（文章与标签，通过 PostTag 中间表）
 * - Post 1:N Comment（文章与评论）
 * - User 1:N Comment（用户与评论）
 * - Comment 自引用（评论与回复）
 * - User/Post/Comment 1:N Like（点赞）
 * - User 1:N Subscription（用户与订阅）
 * - MembershipPlan 1:N Subscription（会员计划与订阅）
 * - User 1:N Payment（用户与支付记录）
 * - Subscription 1:N Payment（订阅与支付记录）
 */
import User from './User';
import Post from './Post';
import Category from './Category';
import Tag from './Tag';
import PostTag from './PostTag';
import Comment from './Comment';
import Like from './Like';
import MembershipPlan from './MembershipPlan';
import Subscription from './Subscription';
import Payment from './Payment';

// ===== 用户 <-> 文章 =====
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// ===== 分类 <-> 文章 =====
Category.hasMany(Post, { foreignKey: 'categoryId', as: 'posts' });
Post.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// ===== 分类自引用（树形结构）=====
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

// ===== 文章 <-> 标签（多对多，通过 PostTag 中间表）=====
Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'postId', as: 'tags' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'tagId', as: 'posts' });

// ===== 文章 <-> 评论 =====
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// ===== 用户 <-> 评论 =====
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// ===== 评论自引用（嵌套回复）=====
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// ===== 点赞关联 =====
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// ===== 会员订阅 =====
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

MembershipPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });
Subscription.belongsTo(MembershipPlan, { foreignKey: 'planId', as: 'plan' });

// ===== 支付记录 =====
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

export {
  User,
  Post,
  Category,
  Tag,
  PostTag,
  Comment,
  Like,
  MembershipPlan,
  Subscription,
  Payment,
};
