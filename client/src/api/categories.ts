import apiClient from './client';
import { ApiResponse, ICategory, ITag } from '@elegant-blog/shared';

export const categoryApi = {
  list: () =>
    apiClient.get<ApiResponse<ICategory[]>>('/categories'),

  create: (data: { name: string; description?: string; parentId?: string }) =>
    apiClient.post<ApiResponse<ICategory>>('/categories', data),
};

export const tagApi = {
  list: () =>
    apiClient.get<ApiResponse<ITag[]>>('/tags'),

  create: (name: string) =>
    apiClient.post<ApiResponse<ITag>>('/tags', { name }),
};
