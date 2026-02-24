import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dayjs from 'dayjs';
import { FiHeart, FiMessageSquare, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { usePostStore } from '../stores/postStore';
import { useAuthStore } from '../stores/authStore';
import { postApi } from '../api/posts';
import CommentSection from '../components/CommentSection';
import ShareButtons from '../components/ShareButtons';
import toast from 'react-hot-toast';

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentPost, isLoading, fetchPostBySlug, clearCurrentPost } = usePostStore();
  const { user, isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchPostBySlug(slug);
    }
    return () => clearCurrentPost();
  }, [slug, fetchPostBySlug, clearCurrentPost]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    if (!currentPost) return;
    try {
      const response = await postApi.toggleLike(currentPost.id);
      if (response.data.success) {
        setLiked(response.data.data!.liked);
        toast.success(response.data.data!.liked ? '已点赞' : '已取消点赞');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!currentPost || !window.confirm('确定要删除这篇文章吗？')) return;
    try {
      await postApi.delete(currentPost.id);
      toast.success('文章已删除');
      navigate('/');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (isLoading) {
    return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  }

  if (!currentPost) {
    return (
      <div className="container main-content">
        <div className="empty-state">
          <h3>文章未找到</h3>
          <p>该文章不存在或已被删除</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>返回首页</Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && currentPost.authorId === user.id;

  return (
    <>
      <Helmet>
        <title>{currentPost.title} - Elegant Blog</title>
        <meta name="description" content={currentPost.excerpt || currentPost.title} />
        <meta property="og:title" content={currentPost.title} />
        <meta property="og:description" content={currentPost.excerpt || currentPost.title} />
        {currentPost.coverImage && <meta property="og:image" content={currentPost.coverImage} />}
      </Helmet>

      <div className="container main-content">
        <article className="post-detail">
          <div className="post-detail-header">
            <h1 className="post-detail-title">{currentPost.title}</h1>
            <div className="post-detail-meta">
              {currentPost.author && (
                <span className="author">
                  {currentPost.author.avatar ? (
                    <img src={currentPost.author.avatar} alt={currentPost.author.displayName} />
                  ) : (
                    <span style={{
                      width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 600
                    }}>
                      {currentPost.author.displayName.charAt(0)}
                    </span>
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{currentPost.author.displayName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {dayjs(currentPost.publishedAt || currentPost.createdAt).format('YYYY年MM月DD日')}
                    </div>
                  </div>
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiEye /> {currentPost.viewCount} 阅读
              </span>
              {currentPost.category && (
                <Link to={`/category/${currentPost.category.slug}`} className="tag">
                  {currentPost.category.name}
                </Link>
              )}
            </div>
          </div>

          {currentPost.coverImage && (
            <img src={currentPost.coverImage} alt={currentPost.title} className="post-detail-cover" />
          )}

          <div className="post-detail-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentPost.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="post-card-tags" style={{ marginTop: 24 }}>
              {currentPost.tags.map((tag) => (
                <Link key={tag.id} to={`/tag/${tag.slug}`} className="tag">{tag.name}</Link>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="post-actions">
            <div className="post-actions-left">
              <button className={`action-btn ${liked ? 'active' : ''}`} onClick={handleLike}>
                <FiHeart /> {currentPost.likeCount} 点赞
              </button>
              <a href="#comments" className="action-btn">
                <FiMessageSquare /> {currentPost.commentCount} 评论
              </a>
              {isAuthor && (
                <>
                  <Link to={`/editor/${currentPost.id}`} className="action-btn">
                    <FiEdit2 /> 编辑
                  </Link>
                  <button className="action-btn" onClick={handleDelete} style={{ color: 'var(--accent)' }}>
                    <FiTrash2 /> 删除
                  </button>
                </>
              )}
            </div>
            <ShareButtons
              url={`/post/${currentPost.slug}`}
              title={currentPost.title}
              description={currentPost.excerpt}
            />
          </div>

          {/* Comments */}
          <div id="comments">
            <CommentSection postId={currentPost.id} />
          </div>
        </article>
      </div>
    </>
  );
};

export default PostDetailPage;
