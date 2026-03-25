import { request } from '@umijs/max';

export interface Notification {
  id: number;
  notice_type?: string;
  renewal_status?: string;
  uuid?: string;
  created_at: string;
}

export interface NotificationListParams {
  page: number;
  pageSize: number;
  noticeType?: string;
  renewalStatus?: string;
  uuid?: string;
}

export interface NotificationListResult {
  total: number;
  list: Notification[];
}

export async function getNotificationList(
  params: NotificationListParams,
): Promise<NotificationListResult> {
  return request('/admin/notification/list', { params });
}
