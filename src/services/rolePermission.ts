import { request } from '@umijs/max';

export async function assignRolePermissions(body: {
  role_id: number;
  permission_ids: number[];
}): Promise<void> {
  return request('/admin/role-permission/assign', {
    method: 'POST',
    data: body,
  });
}
