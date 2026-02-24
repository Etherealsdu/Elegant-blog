import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { FiGithub } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请填写所有字段');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('登录成功');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <>
      <Helmet>
        <title>登录 - Elegant Blog</title>
      </Helmet>

      <div className="auth-page">
        <div className="auth-card">
          <h2>欢迎回来</h2>
          <p className="subtitle">登录你的账户继续</p>

          {/* OAuth Buttons */}
          <div className="oauth-buttons">
            <button className="oauth-btn" onClick={() => handleOAuth('github')}>
              <FiGithub /> GitHub
            </button>
            <button className="oauth-btn" onClick={() => handleOAuth('google')}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="oauth-btn" onClick={() => handleOAuth('wechat')}>
              <span style={{ color: '#07c160', fontWeight: 700 }}>微</span> 微信
            </button>
            <button className="oauth-btn" onClick={() => handleOAuth('alipay')}>
              <span style={{ color: '#1677ff', fontWeight: 700 }}>支</span> 支付宝
            </button>
          </div>

          <div className="divider">或使用邮箱登录</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                type="password"
                className="form-input"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)' }}>
            还没有账户？ <Link to="/register">立即注册</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
