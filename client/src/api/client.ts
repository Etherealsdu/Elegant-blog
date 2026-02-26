/**
 * Axios HTTP 客户端配置
 *
 * 统一的 API 请求客户端，包含：
 * 1. 请求拦截器：自动在 Header 中附带 JWT accessToken
 * 2. 响应拦截器：Token 过期时自动使用 refreshToken 刷新，并重试原请求
 *
 * Token 刷新流程：
 * 1. API 返回 401（Token 过期）
 * 2. 使用 refreshToken 请求新的 accessToken
 * 3. 更新 localStorage 中的 Token
 * 4. 用新 Token 重试原始请求
 * 5. 如果 refreshToken 也失效，清除登录状态并跳转到登录页
 */
import axios from 'axios';

// API 基础 URL：开发环境使用 localhost:5000，生产环境通过环境变量配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== 请求拦截器：自动附带认证 Token =====
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== 响应拦截器：处理 Token 过期自动刷新 =====
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 仅在 401（未授权）且未重试过时，尝试刷新 Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // 标记已重试，防止无限循环

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // 用 refreshToken 获取新的 Token 对
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 用新 Token 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // refreshToken 也失效了，清除登录状态，跳转登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
