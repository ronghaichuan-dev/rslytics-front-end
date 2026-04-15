import { getRoleList, getRoleSelectList, createRole, updateRole, updateRoleStatus, deleteRole } from './role';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('role service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getRoleList calls GET /admin/role/list', async () => {
    mockRequest.mockResolvedValue({ total: 2, list: [] });
    const res = await getRoleList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/role/list', { params: { page: 1, size: 10 } });
    expect(res.total).toBe(2);
  });

  it('getRoleSelectList calls GET /admin/role/select/list', async () => {
    mockRequest.mockResolvedValue({ list: [{ id: 1, roleName: 'Admin' }] });
    const res = await getRoleSelectList();
    expect(mockRequest).toHaveBeenCalledWith('/admin/role/select/list');
    expect(res.list).toHaveLength(1);
  });

  it('createRole calls POST /admin/role/create', async () => {
    const body = { role_name: 'Editor', role_code: 'editor' };
    mockRequest.mockResolvedValue(undefined);
    await createRole(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/role/create', { method: 'POST', data: body });
  });

  it('updateRole calls PUT /admin/role/update', async () => {
    const body = { id: 1, role_name: 'Admin2' };
    mockRequest.mockResolvedValue(undefined);
    await updateRole(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/role/update', { method: 'PUT', data: body });
  });

  it('updateRoleStatus calls PUT /admin/role/status', async () => {
    const body = { id: 1, status: 2 as const };
    mockRequest.mockResolvedValue(undefined);
    await updateRoleStatus(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/role/status', { method: 'PUT', data: body });
  });

  it('deleteRole calls DELETE /admin/role/delete', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteRole(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/role/delete', { method: 'DELETE', data: { id: 1 } });
  });
});
