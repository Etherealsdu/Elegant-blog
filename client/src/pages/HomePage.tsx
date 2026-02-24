import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { usePostStore } from '../stores/postStore';

const HomePage: React.FC = () => {
  const { posts, isLoading, fetchPosts } = usePostStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchPosts({ page, pageSize: 12 });
  }, [page, fetchPosts]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <>
      <Helmet>
        <title>Elegant Blog - 优雅的博客平台</title>
        <meta name="description" content="发现精彩文章，分享知识与见解" />
      </Helmet>

      <div className="container main-content">
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          marginBottom: 40,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 'var(--radius)',
          color: 'white',
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 12 }}>Elegant Blog</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: 600, margin: '0 auto' }}>
            发现精彩文章，分享知识与见解。加入我们的创作者社区。
          </p>
        </div>

        {/* Post Grid */}
        {isLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : posts && posts.items.length > 0 ? (
          <>
            <div className="posts-grid">
              {posts.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={posts.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="empty-state">
            <h3>暂无文章</h3>
            <p>成为第一个发布文章的人吧</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
