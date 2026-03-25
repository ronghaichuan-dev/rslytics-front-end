import { request } from '@umijs/max';

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingListParams {
  page: number;
  size: number;
}

export interface SystemSettingListResult {
  total: number;
  list: SystemSetting[];
}

export async function getSystemSettingList(
  params: SystemSettingListParams,
): Promise<SystemSettingListResult> {
  return request('/admin/system-setting/list', { params });
}

export async function createSystemSetting(body: {
  key: string;
  value: string;
}): Promise<SystemSetting> {
  return request('/admin/system-setting/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateSystemSetting(body: {
  id: number;
  key?: string;
  value?: string;
}): Promise<SystemSetting> {
  return request('/admin/system-setting/update', { method: 'PUT', data: body });
}

export async function deleteSystemSetting(id: number): Promise<void> {
  return request('/admin/system-setting/delete', {
    method: 'DELETE',
    data: { id },
  });
}
