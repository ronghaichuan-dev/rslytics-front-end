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

export async function getRolePermissions(
  roleId: number,
): Promise<{ role_id: number; permissions: Array<{ id: number }> }> {
  return request('/admin/role-permission/permissions', {
    params: { role_id: roleId },
  });
}
