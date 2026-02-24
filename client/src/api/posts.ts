import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  IPost,
  CreatePostRequest,
  UpdatePostRequest,
} from '@elegant-blog/shared';

export const postApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    search?: string;
  }) => apiClient.get<ApiResponse<PaginatedResponse<IPost>>>('/posts', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<IPost>>(`/posts/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<IPost>>(`/posts/slug/${slug}`),

  create: (data: CreatePostRequest) =>
    apiClient.post<ApiResponse<IPost>>('/posts', data),

  update: (id: string, data: UpdatePostRequest) =>
    apiClient.put<ApiResponse<IPost>>(`/posts/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/posts/${id}`),

  toggleLike: (id: string) =>
    apiClient.post<ApiResponse<{ liked: boolean }>>(`/posts/${id}/like`),
};
