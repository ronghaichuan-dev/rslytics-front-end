import { request } from '@umijs/max';

export interface Subscription {
  id: number;
  app_id: string;
  event_id: number;
  event_type?: string;
  country?: string;
  user_id?: string;
  device_id?: string;
  subscription_fee?: number;
  subscribed_at?: string;
  created_at: string;
}

export interface SubscriptionListParams {
  page: number;
  size: number;
  app_id?: string;
  event_id?: number;
  country?: string;
  user_id?: string;
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

export async function getSubscriptionDetail(id: number): Promise<Subscription> {
  return request('/admin/subscription/detail', { params: { id } });
}

export async function createSubscription(body: {
  app_id: string;
  event_id: number;
  country?: string;
  user_id?: string;
  device_id?: string;
  subscription_fee?: number;
  subscribed_at?: string;
}): Promise<Subscription> {
  return request('/admin/subscription/create', { method: 'POST', data: body });
}

export async function updateSubscription(body: {
  id: number;
  country?: string;
  user_id?: string;
  device_id?: string;
  subscription_fee?: number;
  subscribed_at?: string;
}): Promise<Subscription> {
  return request('/admin/subscription/update', { method: 'PUT', data: body });
}

export async function deleteSubscription(id: number): Promise<void> {
  return request('/admin/subscription/delete', {
    method: 'DELETE',
    data: { id },
  });
}
