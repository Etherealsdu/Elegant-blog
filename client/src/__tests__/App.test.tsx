import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock stores
jest.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loadUser: jest.fn(),
  }),
}));

jest.mock('../stores/postStore', () => ({
  usePostStore: () => ({
    posts: null,
    currentPost: null,
    isLoading: false,
    fetchPosts: jest.fn(),
    fetchPostBySlug: jest.fn(),
    fetchPostById: jest.fn(),
    clearCurrentPost: jest.fn(),
  }),
}));

jest.mock('../api/posts', () => ({
  postApi: {
    list: jest.fn().mockResolvedValue({ data: { success: true, data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 } } }),
  },
}));

jest.mock('../api/membership', () => ({
  membershipApi: {
    getPlans: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getMySubscription: jest.fn().mockResolvedValue({ data: { success: true, data: null } }),
  },
}));

jest.mock('../api/categories', () => ({
  categoryApi: { list: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }) },
  tagApi: { list: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }) },
}));

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </HelmetProvider>
  );
};

// Import after mocks
import App from '../App';

describe('App Component', () => {
  it('renders header with logo', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Elegant Blog')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('会员')).toBeInTheDocument();
  });

  it('shows login and register buttons when not authenticated', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});

describe('Routing', () => {
  it('renders home page at /', () => {
    renderWithProviders(<App />, { route: '/' });
    // Hero section text
    expect(screen.getByText('发现精彩文章，分享知识与见解。加入我们的创作者社区。')).toBeInTheDocument();
  });

  it('renders login page at /login', () => {
    renderWithProviders(<App />, { route: '/login' });
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
  });

  it('renders register page at /register', () => {
    renderWithProviders(<App />, { route: '/register' });
    expect(screen.getByText('创建账户')).toBeInTheDocument();
  });

  it('renders membership page at /membership', () => {
    renderWithProviders(<App />, { route: '/membership' });
    expect(screen.getByText('会员计划')).toBeInTheDocument();
  });

  it('redirects to login for protected routes', () => {
    renderWithProviders(<App />, { route: '/dashboard' });
    // Should redirect to login
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
  });
});
