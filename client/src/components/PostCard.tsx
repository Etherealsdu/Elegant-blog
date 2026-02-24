import React from 'react';
import { Link } from 'react-router-dom';
import { IPost, PostVisibility } from '@elegant-blog/shared';
import dayjs from 'dayjs';
import { FiEye, FiHeart, FiMessageSquare } from 'react-icons/fi';

interface PostCardProps {
  post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="card post-card">
      {post.coverImage && (
        <Link to={`/post/${post.slug}`}>
          <img src={post.coverImage} alt={post.title} className="post-card-cover" />
        </Link>
      )}
      <div className="post-card-content">
        {post.visibility === PostVisibility.SUBSCRIBERS_ONLY && (
          <span className="subscriber-badge">订阅专享</span>
        )}
        <Link to={`/post/${post.slug}`}>
          <h3 className="post-card-title">{post.title}</h3>
        </Link>
        <p className="post-card-excerpt">{post.excerpt}</p>
        <div className="post-card-meta">
          {post.author && (
            <span className="author">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.displayName} />
              ) : (
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--primary-light)', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.7rem'
                }}>
                  {post.author.displayName.charAt(0)}
                </span>
              )}
              {post.author.displayName}
            </span>
          )}
          <span>{dayjs(post.publishedAt || post.createdAt).format('YYYY-MM-DD')}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiEye size={14} /> {post.viewCount}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiHeart size={14} /> {post.likeCount}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiMessageSquare size={14} /> {post.commentCount}
          </span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/tag/${tag.slug}`} className="tag">
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
