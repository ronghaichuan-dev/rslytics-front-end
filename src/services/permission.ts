import { request } from '@umijs/max';

export interface Permission {
  id: number;
  permission_name: string;
  permission_code: string;
  module: string;
  route?: string;
  parent_id?: number;
  level: number;
  status: 1 | 2;
  created_at: string;
  updated_at: string;
  children?: Permission[];
}

export interface PermissionListItem {
  id: number;
  permissionName: string;
  permissionCode: string;
  permissionDesc?: string;
  module: string;
  route?: string;
  parentId?: number;
  level: number;
  status: 1 | 2;
  createdAt: string;
  updatedAt: string;
}

export async function getPermissionList(params: {
  page: number;
  size: number;
  permission_name?: string;
  permission_code?: string;
  module?: string;
}): Promise<{ total: number; list: PermissionListItem[] }> {
  return request('/admin/permission/list', { params });
}

export async function getPermissionTree(): Promise<{ tree: Permission[] }> {
  return request('/admin/permission/tree');
}

export async function createPermission(body: {
  permission_name: string;
  permission_code: string;
  module: string;
  route?: string;
  parent_id?: number;
  status?: 1 | 2;
}): Promise<Permission> {
  return request('/admin/permission/create', { method: 'POST', data: body });
}

export async function updatePermission(body: {
  id: number;
  permission_name?: string;
  permission_code?: string;
  module?: string;
  route?: string;
  parent_id?: number;
}): Promise<Permission> {
  return request('/admin/permission/update', { method: 'PUT', data: body });
}

export async function enablePermission(id: number): Promise<void> {
  return request('/admin/permission/enable', { method: 'PUT', data: { id } });
}

export async function disablePermission(id: number): Promise<void> {
  return request('/admin/permission/disable', { method: 'PUT', data: { id } });
}

export async function deletePermission(id: number): Promise<void> {
  return request('/admin/permission/delete', {
    method: 'DELETE',
    data: { id },
  });
}
