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

  fetchPosts: async (params) => {
    set({ isLoading: true });
    try {
      const response = await postApi.list(params);
      set({ posts: response.data.data as PaginatedResponse<IPost>, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPostBySlug: async (slug: string) => {
    set({ isLoading: true });
    try {
      const response = await postApi.getBySlug(slug);
      set({ currentPost: response.data.data as IPost, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPostById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await postApi.getById(id);
      set({ currentPost: response.data.data as IPost, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearCurrentPost: () => set({ currentPost: null }),
}));
