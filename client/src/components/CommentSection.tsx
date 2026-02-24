import React, { useState, useEffect } from 'react';
import { IComment } from '@elegant-blog/shared';
import { commentApi } from '../api/comments';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<IComment[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentApi.listByPost(postId, page, 20);
      if (response.data.success && response.data.data) {
        setComments(response.data.data.items);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await commentApi.create({ content: content.trim(), postId });
      setContent('');
      fetchComments();
      toast.success('评论发布成功');
    } catch (error) {
      toast.error('评论发布失败');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      await commentApi.create({ content: replyContent.trim(), postId, parentId });
      setReplyContent('');
      setReplyTo(null);
      fetchComments();
      toast.success('回复成功');
    } catch (error) {
      toast.error('回复失败');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;
    try {
      await commentApi.delete(commentId);
      fetchComments();
      toast.success('评论已删除');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const renderComment = (comment: IComment, isReply = false) => (
    <div key={comment.id} className="comment-item">
      <div className="comment-avatar">
        {comment.author?.avatar ? (
          <img src={comment.author.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          comment.author?.displayName?.charAt(0) || '?'
        )}
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.author?.displayName || '匿名用户'}</span>
          <span className="comment-time">{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}</span>
        </div>
        <div className="comment-text">{comment.content}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
          {isAuthenticated && !isReply && (
            <button
              className="action-btn"
              style={{ fontSize: '0.85rem', padding: '2px 8px' }}
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              回复
            </button>
          )}
          {user && comment.authorId === user.id && (
            <button
              className="action-btn"
              style={{ fontSize: '0.85rem', padding: '2px 8px', color: 'var(--accent)' }}
              onClick={() => handleDelete(comment.id)}
            >
              删除
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <div style={{ marginTop: 12 }}>
            <textarea
              className="form-input form-textarea"
              style={{ minHeight: 60 }}
              placeholder="写下你的回复..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={() => handleReply(comment.id)}>
                发布回复
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setReplyTo(null)}>
                取消
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="comments-section">
      <h3>评论 ({total})</h3>

      {isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="form-input form-textarea"
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={!content.trim()}>
            发布评论
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
          <p>请 <Link to="/login">登录</Link> 后发表评论</p>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : comments.length > 0 ? (
        <>
          {comments.map((comment) => renderComment(comment))}
          {total > 20 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              <span style={{ padding: '8px 12px' }}>{page} / {Math.ceil(total / 20)}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>暂无评论，来写下第一条评论吧</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
