import { Comment, User, Post } from '../models';
import { AppError } from '../middleware/errorHandler';

export class CommentService {
  static async create(data: {
    content: string;
    postId: string;
    authorId: string;
    parentId?: string;
  }) {
    const post = await Post.findByPk(data.postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (data.parentId) {
      const parentComment = await Comment.findByPk(data.parentId);
      if (!parentComment || parentComment.postId !== data.postId) {
        throw new AppError('Parent comment not found', 404);
      }
    }

    const comment = await Comment.create(data);
    await Post.increment('commentCount', { where: { id: data.postId } });

    return Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatar'] },
      ],
    });
  }

  static async listByPost(postId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Comment.findAndCountAll({
      where: { postId, parentId: null },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatar'] },
        {
          model: Comment,
          as: 'replies',
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatar'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  static async delete(id: string, userId: string) {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.authorId !== userId) {
      throw new AppError('You can only delete your own comments', 403);
    }

    const postId = comment.postId;
    // Delete replies first
    await Comment.destroy({ where: { parentId: id } });
    await comment.destroy();
    await Post.decrement('commentCount', { where: { id: postId } });

    return { message: 'Comment deleted successfully' };
  }
}
