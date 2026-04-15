import { request } from '@umijs/max';

export interface Role {
  id: number;
  roleName: string;
  roleCode: string;
  roleDesc?: string;
  status: 1 | 2;
  createdAt: string;
  updatedAt: string;
}

export interface RoleListParams {
  page: number;
  size: number;
}

export interface RoleListResult {
  total: number;
  list: Role[];
}

export interface RoleSelectItem {
  id: number;
  roleName: string;
  roleCode: string;
}

export async function getRoleList(
  params: RoleListParams,
): Promise<RoleListResult> {
  return request('/admin/role/list', { params });
}

export async function getRoleSelectList(): Promise<{ list: RoleSelectItem[] }> {
  return request('/admin/role/select/list');
}

export async function createRole(body: {
  role_name: string;
  role_code: string;
  role_desc?: string;
}): Promise<void> {
  return request('/admin/role/create', { method: 'POST', data: body });
}

export async function updateRole(body: {
  id: number;
  role_name?: string;
  role_code?: string;
  role_desc?: string;
}): Promise<void> {
  return request('/admin/role/update', { method: 'PUT', data: body });
}

export async function updateRoleStatus(body: {
  id: number;
  status: 1 | 2;
}): Promise<void> {
  return request('/admin/role/status', { method: 'PUT', data: body });
}

export async function deleteRole(id: number): Promise<void> {
  return request('/admin/role/delete', { method: 'DELETE', data: { id } });
}
