import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IPost, PaginatedResponse } from '@elegant-blog/shared';
import { postApi } from '../api/posts';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [results, setResults] = useState<PaginatedResponse<IPost> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      search();
    }
  }, [query, page]);

  const search = async () => {
    setLoading(true);
    try {
      const response = await postApi.list({ search: query, page, pageSize: 12 });
      if (response.data.success) {
        setResults(response.data.data as PaginatedResponse<IPost>);
      }
    } catch (error) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>搜索: {query} - Elegant Blog</title>
      </Helmet>

      <div className="container main-content">
        <h1 style={{ marginBottom: 8 }}>搜索结果</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          关键词: &ldquo;{query}&rdquo;
          {results && <span> &middot; 共 {results.total} 个结果</span>}
        </p>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : results && results.items.length > 0 ? (
          <>
            <div className="posts-grid">
              {results.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={results.totalPages}
              onPageChange={(p) => setSearchParams({ q: query, page: p.toString() })}
            />
          </>
        ) : (
          <div className="empty-state">
            <h3>未找到相关文章</h3>
            <p>试试其他关键词</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
