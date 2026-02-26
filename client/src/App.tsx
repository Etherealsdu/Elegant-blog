/**
 * 应用根组件
 *
 * 负责：
 * 1. 应用启动时自动加载用户登录状态（从 localStorage 恢复）
 * 2. 定义前端路由结构
 * 3. 渲染全局组件（Header、Footer、Toast 通知）
 *
 * 路由结构：
 * - /                    首页（文章列表）
 * - /login               登录页
 * - /register            注册页
 * - /auth/callback       OAuth 登录回调页
 * - /post/:slug          文章详情页
 * - /search              搜索结果页
 * - /membership          会员计划页
 * - /editor              新建文章（需登录）
 * - /editor/:id          编辑文章（需登录）
 * - /dashboard           我的文章管理（需登录）
 * - /profile             个人设置（需登录）
 */
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostDetailPage from './pages/PostDetailPage';
import EditorPage from './pages/EditorPage';
import DashboardPage from './pages/DashboardPage';
import MembershipPage from './pages/MembershipPage';
import ProfilePage from './pages/ProfilePage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import SearchPage from './pages/SearchPage';

/**
 * 路由守卫组件：需要登录才能访问的页面
 * 未登录时自动跳转到登录页，加载中显示 Loading 动画
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const { loadUser } = useAuthStore();

  // 应用启动时，检查本地 Token 并加载用户信息
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      {/* 全局 Toast 通知（居中显示，3 秒自动消失） */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2d3436',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      <Header />
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/post/:slug" element={<PostDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/membership" element={<MembershipPage />} />

        {/* 需要登录的页面（PrivateRoute 保护） */}
        <Route
          path="/editor"
          element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
