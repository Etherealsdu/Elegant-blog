// ============================================
// Shared Types for Elegant Blog Platform
// ============================================

// --- User Types ---
export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GITHUB = 'github',
  GOOGLE = 'google',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  provider: AuthProvider;
  providerId?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Blog/Post Types ---
export enum PostVisibility {
  PUBLIC = 'public',
  SUBSCRIBERS_ONLY = 'subscribers_only',
  PRIVATE = 'private',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorId: string;
  author?: IUser;
  categoryId?: string;
  category?: ICategory;
  tags?: ITag[];
  visibility: PostVisibility;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  postCount: number;
}

export interface ITag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

// --- Comment Types ---
export interface IComment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: IUser;
  parentId?: string;
  replies?: IComment[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- Membership Types ---
export enum MembershipPlan {
  FREE = 'free',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  WECHAT_PAY = 'wechat_pay',
  ALIPAY = 'alipay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
}

export interface IMembershipPlan {
  id: string;
  name: string;
  plan: MembershipPlan;
  price: number;
  currency: string;
  durationDays: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface ISubscription {
  id: string;
  userId: string;
  planId: string;
  plan?: IMembershipPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface IPayment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  status: PaymentStatus;
  description: string;
  createdAt: string;
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

// --- Request Types ---
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  visibility: PostVisibility;
  status: PostStatus;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Share Types ---
export enum SharePlatform {
  WECHAT = 'wechat',
  WEIBO = 'weibo',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  COPY_LINK = 'copy_link',
}
