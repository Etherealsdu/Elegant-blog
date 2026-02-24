import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  IMembershipPlan,
  ISubscription,
  IPayment,
  PaymentProvider,
} from '@elegant-blog/shared';

export const membershipApi = {
  getPlans: () =>
    apiClient.get<ApiResponse<IMembershipPlan[]>>('/membership/plans'),

  getMySubscription: () =>
    apiClient.get<ApiResponse<ISubscription | null>>('/membership/subscription'),

  subscribe: (planId: string, provider: PaymentProvider) =>
    apiClient.post<ApiResponse<{ paymentId: string; paymentUrl: string; provider: string }>>('/membership/subscribe', {
      planId,
      provider,
    }),

  cancelSubscription: (id: string) =>
    apiClient.post<ApiResponse<ISubscription>>(`/membership/subscription/${id}/cancel`),

  getPaymentHistory: (page?: number, pageSize?: number) =>
    apiClient.get<ApiResponse<PaginatedResponse<IPayment>>>('/membership/payments', {
      params: { page, pageSize },
    }),
};
