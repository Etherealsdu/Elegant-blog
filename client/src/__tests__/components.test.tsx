import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import ShareButtons from '../components/ShareButtons';
import { PostVisibility, PostStatus } from '@elegant-blog/shared';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

const mockPost = {
  id: '1',
  title: 'Test Post Title',
  slug: 'test-post-title',
  content: '# Test content',
  excerpt: 'This is a test post excerpt',
  coverImage: 'https://example.com/image.jpg',
  authorId: 'user-1',
  author: {
    id: 'user-1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    email: 'test@example.com',
    role: 'user' as any,
    provider: 'local' as any,
    bio: '',
    isEmailVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  categoryId: undefined,
  category: undefined,
  tags: [
    { id: 'tag-1', name: 'React', slug: 'react', postCount: 5 },
    { id: 'tag-2', name: 'TypeScript', slug: 'typescript', postCount: 3 },
  ],
  visibility: PostVisibility.PUBLIC,
  status: PostStatus.PUBLISHED,
  viewCount: 100,
  likeCount: 25,
  commentCount: 10,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15',
  publishedAt: '2024-01-15',
};

describe('PostCard Component', () => {
  it('renders post title', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders post excerpt', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders subscriber badge for subscribers-only posts', () => {
    const subscriberPost = {
      ...mockPost,
      visibility: PostVisibility.SUBSCRIBERS_ONLY,
    };
    render(
      <MemoryRouter>
        <PostCard post={subscriberPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('订阅专享')).toBeInTheDocument();
  });

  it('renders cover image', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    const img = screen.getByAlt('Test Post Title');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('links to post detail page', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    const postLink = links.find((link) => link.getAttribute('href') === '/post/test-post-title');
    expect(postLink).toBeTruthy();
  });
});

describe('Pagination Component', () => {
  it('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders pagination buttons', () => {
    render(
      <Pagination page={1} totalPages={5} onPageChange={jest.fn()} />
    );
    expect(screen.getByText('上一页')).toBeInTheDocument();
    expect(screen.getByText('下一页')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination page={1} totalPages={5} onPageChange={jest.fn()} />
    );
    expect(screen.getByText('上一页')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination page={5} totalPages={5} onPageChange={jest.fn()} />
    );
    expect(screen.getByText('下一页')).toBeDisabled();
  });

  it('calls onPageChange when clicking buttons', () => {
    const handleChange = jest.fn();
    render(
      <Pagination page={3} totalPages={5} onPageChange={handleChange} />
    );
    fireEvent.click(screen.getByText('下一页'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('highlights active page', () => {
    render(
      <Pagination page={3} totalPages={5} onPageChange={jest.fn()} />
    );
    const activeBtn = screen.getByText('3');
    expect(activeBtn.className).toContain('active');
  });
});

describe('ShareButtons Component', () => {
  it('renders all share buttons', () => {
    render(<ShareButtons url="/post/test" title="Test Post" />);
    expect(screen.getByTitle('分享到微信')).toBeInTheDocument();
    expect(screen.getByTitle('分享到微博')).toBeInTheDocument();
    expect(screen.getByTitle('Share on Twitter')).toBeInTheDocument();
    expect(screen.getByTitle('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByTitle('复制链接')).toBeInTheDocument();
  });

  it('opens share links in new window', () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    render(<ShareButtons url="/post/test" title="Test Post" />);
    fireEvent.click(screen.getByTitle('分享到微博'));
    expect(mockOpen).toHaveBeenCalled();
  });
});
