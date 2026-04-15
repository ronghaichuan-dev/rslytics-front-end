import { request } from '@umijs/max';

export interface AppEventLog {
  id: number;
  appid: string;
  eventCode: string;
  userId: string;
  responseText?: string;
  createdAt: string;
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
): Promise<{ event_log: AppEventLog }> {
  return request('/admin/app-event-log/detail', { params: { id } });
}
