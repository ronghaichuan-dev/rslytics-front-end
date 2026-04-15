import { assignRolePermissions, getRolePermissions } from './rolePermission';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('rolePermission service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('assignRolePermissions calls POST /admin/role-permission/assign', async () => {
    const body = { role_id: 1, permission_ids: [1, 2, 3] };
    mockRequest.mockResolvedValue(undefined);
    await assignRolePermissions(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/role-permission/assign', { method: 'POST', data: body });
  });

  it('getRolePermissions calls GET /admin/role-permission/permissions', async () => {
    mockRequest.mockResolvedValue({ role_id: 1, permissions: [{ id: 1 }] });
    const res = await getRolePermissions(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/role-permission/permissions', { params: { role_id: 1 } });
    expect(res.permissions).toHaveLength(1);
  });
});
