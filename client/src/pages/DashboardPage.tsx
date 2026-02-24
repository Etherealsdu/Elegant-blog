import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IPost, PaginatedResponse, PostStatus } from '@elegant-blog/shared';
import { postApi } from '../api/posts';
import { useAuthStore } from '../stores/authStore';
import dayjs from 'dayjs';
import { FiEdit2, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<PaginatedResponse<IPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user) fetchMyPosts();
  }, [user, filter, page]);

  const fetchMyPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params: any = { authorId: user.id, page, pageSize: 10 };
      if (filter !== 'all') params.status = filter;
      const response = await postApi.list(params);
      if (response.data.success) {
        setPosts(response.data.data as PaginatedResponse<IPost>);
      }
    } catch (error) {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    try {
      await postApi.delete(postId);
      toast.success('文章已删除');
      fetchMyPosts();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  return (
    <>
      <Helmet>
        <title>我的文章 - Elegant Blog</title>
      </Helmet>

      <div className="container main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>我的文章</h1>
          <Link to="/editor" className="btn btn-primary">
            <FiPlus /> 撰写新文章
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { value: 'all', label: '全部' },
            { value: PostStatus.PUBLISHED, label: '已发布' },
            { value: PostStatus.DRAFT, label: '草稿' },
            { value: PostStatus.ARCHIVED, label: '已归档' },
          ].map((f) => (
            <button
              key={f.value}
              className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter(f.value); setPage(1); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : posts && posts.items.length > 0 ? (
          <div>
            {posts.items.map((post) => (
              <div
                key={post.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Link to={`/post/${post.slug}`} style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                      {post.title}
                    </Link>
                    <span className={`tag`} style={{
                      background: post.status === PostStatus.PUBLISHED ? '#00b894' :
                        post.status === PostStatus.DRAFT ? '#fdcb6e' : '#b2bec3',
                      color: 'white',
                    }}>
                      {post.status === PostStatus.PUBLISHED ? '已发布' :
                        post.status === PostStatus.DRAFT ? '草稿' : '已归档'}
                    </span>
                    {post.visibility === 'subscribers_only' && (
                      <span className="subscriber-badge">订阅专享</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {dayjs(post.updatedAt).format('YYYY-MM-DD HH:mm')} &middot;
                    {post.viewCount} 阅读 &middot; {post.likeCount} 点赞 &middot; {post.commentCount} 评论
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/post/${post.slug}`} className="btn btn-sm btn-secondary">
                    <FiEye />
                  </Link>
                  <Link to={`/editor/${post.id}`} className="btn btn-sm btn-secondary">
                    <FiEdit2 />
                  </Link>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(post.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}

            {posts.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
                <span style={{ padding: '8px 12px' }}>{page} / {posts.totalPages}</span>
                <button disabled={page >= posts.totalPages} onClick={() => setPage(page + 1)}>下一页</button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>还没有文章</h3>
            <p>开始撰写你的第一篇文章吧</p>
            <Link to="/editor" className="btn btn-primary" style={{ marginTop: 16 }}>
              <FiPlus /> 撰写新文章
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
