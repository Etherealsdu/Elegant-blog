import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setAuthFromTokens } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error('登录失败，请重试');
      navigate('/login');
      return;
    }

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
