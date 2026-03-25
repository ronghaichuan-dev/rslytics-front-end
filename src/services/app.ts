import { request } from '@umijs/max';

export interface App {
  id: number;
  appid: string;
  app_name: string;
  icon?: string;
  subscription_fee?: number;
  event_ids?: number[];
  created_at: string;
  updated_at: string;
}

export interface AppListParams {
  page: number;
  size: number;
  keyword?: string;
}

export interface AppListResult {
  total: number;
  list: App[];
}

export interface AppSelectItem {
  app_id: string;
  app_name: string;
}

export interface SubscriptionTrendItem {
  date: string;
  count: number;
  amount: number;
}

export async function getAppList(
  params: AppListParams,
): Promise<AppListResult> {
  return request('/admin/app/list', { params });
}

export async function createApp(body: {
  appid: string;
  app_name: string;
  icon?: string;
  subscription_fee?: number;
  event_ids?: number[];
}): Promise<App> {
  return request('/admin/app/create', { method: 'POST', data: body });
}

export async function updateApp(body: {
  id: number;
  app_name?: string;
  icon?: string;
  subscription_fee?: number;
  event_ids?: number[];
}): Promise<App> {
  return request('/admin/app/update', { method: 'PUT', data: body });
}

export async function deleteApp(id: number): Promise<void> {
  return request('/admin/app/delete', { method: 'DELETE', data: { id } });
}

export async function getAppSubscriptionTrend(
  app_id: string,
): Promise<{ list: SubscriptionTrendItem[] }> {
  return request('/admin/app/subscription/trend', { params: { app_id } });
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  return request('/admin/upload', { method: 'POST', data: form });
}
