import { request } from '@umijs/max';

export interface AppEventLog {
  id: number;
  appid: string;
  event_code: string;
  user_id: string;
  created_at: string;
}

export interface AppEventLogDetail extends AppEventLog {
  event_data?: Record<string, unknown>;
}

export interface AppEventLogListParams {
  page: number;
  size: number;
  appid?: string;
  user_id?: string;
}

export interface AppEventLogListResult {
  total: number;
  list: AppEventLog[];
}

export async function getAppEventLogList(
  params: AppEventLogListParams,
): Promise<AppEventLogListResult> {
  return request('/admin/app-event-log/list', { params });
}

export async function getAppEventLogDetail(
  id: number,
): Promise<AppEventLogDetail> {
  return request('/admin/app-event-log/detail', { params: { id } });
}
