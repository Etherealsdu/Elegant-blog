/**
 * 用户认证状态管理（Zustand Store）
 *
 * 管理全局认证状态，包括：
 * - 当前登录用户信息
 * - 登录/注册/登出操作
 * - JWT Token 的本地存储管理
 * - 页面加载时自动恢复登录状态
 *
 * Token 存储策略：
 * - accessToken 和 refreshToken 存储在 localStorage 中
 * - 每次 API 请求自动附带 accessToken（由 apiClient 拦截器处理）
 * - accessToken 过期时，apiClient 拦截器自动使用 refreshToken 刷新
 */
import { create } from 'zustand';
import { IUser } from '@elegant-blog/shared';
import { authApi } from '../api/auth';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;                // 初始加载状态（检查本地 Token 是否有效）
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setAuthFromTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /** 邮箱密码登录 */
  login: async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { user, accessToken, refreshToken } = response.data.data!;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user: user as IUser, isAuthenticated: true });
  },

  /** 邮箱注册并自动登录 */
  register: async (email: string, username: string, password: string, displayName?: string) => {
    const response = await authApi.register({ email, username, password, displayName });
    const { user, accessToken, refreshToken } = response.data.data!;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user: user as IUser, isAuthenticated: true });
  },

  /** 登出：清除本地 Token 和用户状态 */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  /**
   * 页面加载时调用：检查本地是否有有效的 Token
   * 如果有，从服务器获取当前用户信息；如果 Token 失效，清除登录状态
   */
  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await authApi.getProfile();
      set({ user: response.data.data as IUser, isAuthenticated: true, isLoading: false });
    } catch {
      // Token 无效或过期，清除本地状态
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * OAuth 回调专用：直接设置 Token 并加载用户信息
   * 由 AuthCallbackPage 调用，从 URL fragment 获取 Token 后使用
   */
  setAuthFromTokens: async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    try {
      const response = await authApi.getProfile();
      set({ user: response.data.data as IUser, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
