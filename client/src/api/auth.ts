import apiClient from './client';
import { LoginRequest, RegisterRequest, LoginResponse, ApiResponse, IUser } from '@elegant-blog/shared';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken }),

  getProfile: () =>
    apiClient.get<ApiResponse<IUser>>('/auth/profile'),

  updateProfile: (data: Partial<IUser>) =>
    apiClient.put<ApiResponse<IUser>>('/auth/profile', data),
};
