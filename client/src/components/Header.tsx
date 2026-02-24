import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { FiEdit3, FiSearch } from 'react-icons/fi';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="header-logo">
          Elegant Blog
        </Link>

        <nav className="header-nav">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            首页
          </Link>
          <Link to="/categories" className={isActive('/categories') ? 'active' : ''}>
            分类
          </Link>
          <Link to="/membership" className={isActive('/membership') ? 'active' : ''}>
            会员
          </Link>
        </nav>

        <div className="header-actions">
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '200px', padding: '6px 12px', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-sm btn-secondary">
              <FiSearch />
            </button>
          </form>

          {isAuthenticated && user ? (
            <>
              <Link to="/editor" className="btn btn-sm btn-primary">
                <FiEdit3 /> 写文章
              </Link>
              <div className="user-menu">
                <button
                  className="user-avatar-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.displayName.charAt(0).toUpperCase()
                  )}
                </button>
                {showDropdown && (
                  <div className="user-dropdown">
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>@{user.username}</div>
                    </div>
                    <Link to="/dashboard" onClick={() => setShowDropdown(false)}>我的文章</Link>
                    <Link to="/profile" onClick={() => setShowDropdown(false)}>个人设置</Link>
                    <Link to="/membership" onClick={() => setShowDropdown(false)}>会员中心</Link>
                    <button onClick={handleLogout}>退出登录</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-secondary">登录</Link>
              <Link to="/register" className="btn btn-sm btn-primary">注册</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
