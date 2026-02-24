import apiClient from './client';
import { ApiResponse, PaginatedResponse, IComment, CreateCommentRequest } from '@elegant-blog/shared';

export const commentApi = {
  listByPost: (postId: string, page?: number, pageSize?: number) =>
    apiClient.get<ApiResponse<PaginatedResponse<IComment>>>(`/comments/post/${postId}`, {
      params: { page, pageSize },
    }),

  create: (data: CreateCommentRequest) =>
    apiClient.post<ApiResponse<IComment>>('/comments', data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/comments/${id}`),
};
