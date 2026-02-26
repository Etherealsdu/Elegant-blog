/**
 * 文章数据模型
 *
 * 对应数据库 posts 表，存储博客文章数据。
 *
 * 特性：
 * - slug 自动从标题生成（URL 友好），附加时间戳确保唯一性
 * - 支持三种可见性：公开（public）、订阅专享（subscribers_only）、私密（private）
 * - 支持三种状态：草稿（draft）、已发布（published）、已归档（archived）
 * - 自动维护浏览量、点赞数、评论数计数器
 * - 首次发布时自动记录发布时间
 */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PostVisibility, PostStatus } from '@elegant-blog/shared';
import slugify from 'slugify';

interface PostAttributes {
  id: string;
  title: string;
  slug: string;           // URL 友好的标识符，如 "my-first-post-1704067200000"
  content: string;         // Markdown 格式的文章正文
  excerpt?: string;        // 文章摘要，用于列表页展示
  coverImage?: string;     // 封面图片 URL
  authorId: string;        // 关联用户 ID
  categoryId?: string;     // 关联分类 ID
  visibility: PostVisibility;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: Date;      // 首次发布时间
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'slug' | 'visibility' | 'status' | 'viewCount' | 'likeCount' | 'commentCount'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public title!: string;
  public slug!: string;
  public content!: string;
  public excerpt!: string;
  public coverImage!: string;
  public authorId!: string;
  public categoryId!: string;
  public visibility!: PostVisibility;
  public status!: PostStatus;
  public viewCount!: number;
  public likeCount!: number;
  public commentCount!: number;
  public publishedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { len: [1, 500] },
    },
    slug: {
      type: DataTypes.STRING(600),
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    visibility: {
      type: DataTypes.ENUM(...Object.values(PostVisibility)),
      defaultValue: PostVisibility.PUBLIC,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PostStatus)),
      defaultValue: PostStatus.DRAFT,
      allowNull: false,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    hooks: {
      // 验证前自动生成 slug：将标题转为 URL 友好格式，附加时间戳防重复
      beforeValidate: (post) => {
        if (post.title && (!post.slug || post.changed('title'))) {
          post.slug = slugify(post.title, { lower: true, strict: true }) + '-' + Date.now();
        }
      },
      // 更新时：如果状态变为 published 且没有发布时间，自动记录
      beforeUpdate: (post) => {
        if (post.changed('status') && post.status === PostStatus.PUBLISHED && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      },
    },
  }
);

export default Post;
