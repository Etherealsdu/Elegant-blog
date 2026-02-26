import { Op } from 'sequelize';
import { Post, User, Category, Tag, PostTag, Like, Comment } from '../models';
import { PostVisibility, PostStatus } from '@elegant-blog/shared';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';

export class PostService {
  static async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    categoryId?: string;
    tagIds?: string[];
    visibility: PostVisibility;
    status: PostStatus;
    authorId: string;
  }) {
    const post = await Post.create({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 200),
      coverImage: data.coverImage,
      categoryId: data.categoryId,
      visibility: data.visibility,
      status: data.status,
      authorId: data.authorId,
      slug: slugify(data.title, { lower: true, strict: true }) + '-' + Date.now(),
      publishedAt: data.status === PostStatus.PUBLISHED ? new Date() : undefined,
    });

    if (data.tagIds && data.tagIds.length > 0) {
      await PostTag.bulkCreate(
        data.tagIds.map((tagId) => ({ postId: post.id, tagId }))
      );
    }

    return this.findById(post.id);
  }

  static async findById(id: string) {
    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatar'] },
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' },
      ],
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return post;
  }

  static async findBySlug(slug: string) {
    const post = await Post.findOne({
      where: { slug },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatar'] },
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' },
      ],
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return post;
  }

  static async list(params: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    status?: PostStatus;
    visibility?: PostVisibility;
    search?: string;
    userId?: string; // current user for visibility check
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    // Visibility logic
    if (params.userId) {
      // Logged-in user can see public and subscriber-only posts
      where.visibility = { [Op.in]: [PostVisibility.PUBLIC, PostVisibility.SUBSCRIBERS_ONLY] };
    } else {
      where.visibility = PostVisibility.PUBLIC;
    }

    if (params.status) {
      where.status = params.status;
    } else {
      where.status = PostStatus.PUBLISHED;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.authorId) {
      where.authorId = params.authorId;
    }

    if (params.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${params.search}%` } },
        { content: { [Op.iLike]: `%${params.search}%` } },
      ];
    }

    // 构建 Tag 关联查询：按标签筛选时添加 where 条件
    // 注意：不能 push 两个相同 alias 的 include，否则 Sequelize 会报错
    const tagInclude: any = { model: Tag, as: 'tags' };
    if (params.tagId) {
      tagInclude.where = { id: params.tagId };
      tagInclude.through = { attributes: [] };
    }

    const include: any[] = [
      { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatar'] },
      { model: Category, as: 'category' },
      tagInclude,
    ];

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  static async update(id: string, authorId: string, data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    coverImage: string;
    categoryId: string;
    tagIds: string[];
    visibility: PostVisibility;
    status: PostStatus;
  }>) {
    const post = await Post.findByPk(id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId !== authorId) {
      throw new AppError('You can only edit your own posts', 403);
    }

    await post.update(data);

    if (data.tagIds !== undefined) {
      await PostTag.destroy({ where: { postId: id } });
      if (data.tagIds.length > 0) {
        await PostTag.bulkCreate(
          data.tagIds.map((tagId) => ({ postId: id, tagId }))
        );
      }
    }

    return this.findById(id);
  }

  static async delete(id: string, authorId: string) {
    const post = await Post.findByPk(id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId !== authorId) {
      throw new AppError('You can only delete your own posts', 403);
    }

    await PostTag.destroy({ where: { postId: id } });
    await Comment.destroy({ where: { postId: id } });
    await Like.destroy({ where: { postId: id } });
    await post.destroy();

    return { message: 'Post deleted successfully' };
  }

  static async incrementViewCount(id: string) {
    await Post.increment('viewCount', { where: { id } });
  }

  static async toggleLike(postId: string, userId: string) {
    const existing = await Like.findOne({ where: { postId, userId } });
    if (existing) {
      await existing.destroy();
      await Post.decrement('likeCount', { where: { id: postId } });
      return { liked: false };
    } else {
      await Like.create({ userId, postId });
      await Post.increment('likeCount', { where: { id: postId } });
      return { liked: true };
    }
  }
}
