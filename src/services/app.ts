import { request } from '@umijs/max';

export interface App {
  appid: string;
  app_name: string;
  company_id?: number;
  company_name?: string;
  app_token?: string;
  icon?: string;
  subscription_fee?: number;
  created_at: string;
  updated_at: string;
}

export interface AppListParams {
  page: number;
  size: number;
  appid?: string;
  app_name?: string;
}

export interface AppListResult {
  total: number;
  list: App[];
}

export interface AppSelectItem {
  app_id: string;
  app_name: string;
  company_id?: number;
  company_name?: string;
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
  company_id: number;
  icon?: string;
  subscription_fee?: number;
  events?: number[];
}): Promise<void> {
  return request('/admin/app/create', { method: 'POST', data: body });
}

export async function updateApp(body: {
  appid: string;
  company_id?: number;
  app_name?: string;
  icon?: string;
  subscription_fee?: number;
  events?: number[];
}): Promise<void> {
  return request('/admin/app/update', { method: 'PUT', data: body });
}

export async function deleteApp(appid: string): Promise<void> {
  return request('/admin/app/delete', { method: 'DELETE', data: { appid } });
}

export async function getAppSubscriptionTrend(
  appid: string,
): Promise<{ trend: any[] }> {
  return request('/admin/app/subscription/trend', { params: { appid } });
}

export async function getAppToken(appid: string): Promise<{ token?: string; app_token?: string }> {
  return request('/admin/app/token', { params: { appid } });
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  return request('/admin/upload/upload/image', { method: 'POST', data: form });
}
