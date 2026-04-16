import { request } from '@umijs/max';

export interface Subscription {
  id: number;
  environment: string;
  orignialTransactionId: string;
  rsid: string;
  appId: string;
  productId: string;
  status: number;
  autoRenewStatus: number;
  isTrial: number;
  isPaid: number;
  lastEventAt: number;
  expiresReason: number;
  expiresAt: number;
  offerType: string;
  offerId: string;
  revocationDate: number;
  revocationReason: number;
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionListParams {
  page: number;
  size: number;
  app_id?: string;
  status?: number;
  auto_renew_status?: number;
}

export interface SubscriptionListResult {
  total: number;
  list: Subscription[];
}

export async function getSubscriptionList(
  params: SubscriptionListParams,
): Promise<SubscriptionListResult> {
  return request('/admin/subscription/list', { params });
}

export async function getSubscriptionDetail(
  id: number,
): Promise<Subscription> {
  return request('/admin/subscription/detail', { params: { id } });
}