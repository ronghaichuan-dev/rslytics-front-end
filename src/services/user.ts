import { request } from '@umijs/max';

export interface User {
  id: number;
  username: string;
  email?: string;
  role_id?: number;
  role_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserListParams {
  page: number;
  size: number;
  username?: string;
  email?: string;
}

export interface UserListResult {
  total: number;
  list: User[];
}

export async function getUserList(
  params: UserListParams,
): Promise<UserListResult> {
  return request('/admin/user/list', { params });
}

export async function createUser(body: {
  username: string;
  password: string;
  role_id?: number;
}): Promise<User> {
  return request('/admin/user/create', { method: 'POST', data: body });
}

export async function updateUser(body: {
  id: number;
  username?: string;
  role_id?: number;
}): Promise<User> {
  return request('/admin/user/update', { method: 'PUT', data: body });
}

export async function deleteUser(id: number): Promise<void> {
  return request('/admin/user/delete', { method: 'DELETE', data: { id } });
}

export interface UserDetail {
  id: number;
  username: string;
  roleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getUserDetail(id: number): Promise<{ user: UserDetail }> {
  return request('/admin/user/detail', { params: { id } });
}
