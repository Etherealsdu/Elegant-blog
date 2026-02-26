import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

/**
 * OAuth 登录回调页面
 *
 * 服务端完成 OAuth 认证后，会将 accessToken 和 refreshToken
 * 通过 URL fragment（#）传递到此页面。
 * 使用 fragment 而非 query string 是为了避免 token 出现在
 * 服务器日志、浏览器历史和 Referer 头中，提高安全性。
 */
const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setAuthFromTokens } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 错误信息仍通过 query string 传递（非敏感数据）
    const error = searchParams.get('error');

    if (error) {
      toast.error('登录失败，请重试');
      navigate('/login');
      return;
    }

    // 从 URL fragment（#后面的部分）中解析 token
    // 服务端重定向格式: /auth/callback#accessToken=xxx&refreshToken=xxx
    const hash = window.location.hash.substring(1); // 去掉开头的 #
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('accessToken');
    const refreshToken = hashParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setAuthFromTokens(accessToken, refreshToken).then(() => {
        toast.success('登录成功');
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, setAuthFromTokens, navigate]);

  return (
    <div className="loading" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <p style={{ marginLeft: 16 }}>正在登录...</p>
    </div>
  );
};

export default AuthCallbackPage;
