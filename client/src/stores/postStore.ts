/**
 * 文章状态管理（Zustand Store）
 *
 * 管理文章相关的全局状态：
 * - posts：文章列表（分页数据）
 * - currentPost：当前查看的文章详情
 * - isLoading：加载状态
 *
 * 提供的操作：
 * - fetchPosts：获取文章列表（支持分页、搜索、分类筛选等参数）
 * - fetchPostBySlug：按 slug 获取文章详情（用于前台展示）
 * - fetchPostById：按 ID 获取文章详情（用于编辑器加载）
 * - clearCurrentPost：清除当前文章（组件卸载时调用，防止闪烁旧数据）
 */
import { create } from 'zustand';
import { IPost, PaginatedResponse } from '@elegant-blog/shared';
import { postApi } from '../api/posts';

interface PostState {
  posts: PaginatedResponse<IPost> | null;
  currentPost: IPost | null;
  isLoading: boolean;
  fetchPosts: (params?: Record<string, any>) => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  clearCurrentPost: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: null,
  currentPost: null,
  isLoading: false,

  /** 获取文章列表，支持 page/pageSize/search/categoryId/tagId/authorId 等查询参数 */
  fetchPosts: async (params) => {
    set({ isLoading: true });
    try {
      const response = await postApi.list(params);
      set({ posts: response.data.data as PaginatedResponse<IPost>, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 按 slug 获取文章详情（前台文章页使用） */
  fetchPostBySlug: async (slug: string) => {
    set({ isLoading: true });
    try {
      const response = await postApi.getBySlug(slug);
      set({ currentPost: response.data.data as IPost, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 按 ID 获取文章详情（编辑器加载文章时使用） */
  fetchPostById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await postApi.getById(id);
      set({ currentPost: response.data.data as IPost, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 清除当前文章（防止页面切换时闪烁旧数据） */
  clearCurrentPost: () => set({ currentPost: null }),
}));
