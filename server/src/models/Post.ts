import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PostVisibility, PostStatus } from '@elegant-blog/shared';
import slugify from 'slugify';

interface PostAttributes {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorId: string;
  categoryId?: string;
  visibility: PostVisibility;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: Date;
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
      beforeValidate: (post) => {
        if (post.title && (!post.slug || post.changed('title'))) {
          post.slug = slugify(post.title, { lower: true, strict: true }) + '-' + Date.now();
        }
      },
      beforeUpdate: (post) => {
        if (post.changed('status') && post.status === PostStatus.PUBLISHED && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      },
    },
  }
);

export default Post;
