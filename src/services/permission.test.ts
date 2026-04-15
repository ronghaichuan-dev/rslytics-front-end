import {
  getPermissionList, getPermissionTree, createPermission,
  updatePermission, enablePermission, disablePermission, deletePermission,
} from './permission';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('permission service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getPermissionList', async () => {
    mockRequest.mockResolvedValue({ total: 1, list: [] });
    await getPermissionList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/list', { params: { page: 1, size: 10 } });
  });

  it('getPermissionTree', async () => {
    mockRequest.mockResolvedValue({ tree: [] });
    await getPermissionTree();
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/tree');
  });

  it('createPermission', async () => {
    const body = { permission_name: 'test', permission_code: 'test', module: 'sys' };
    mockRequest.mockResolvedValue({});
    await createPermission(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/create', { method: 'POST', data: body });
  });

  it('updatePermission', async () => {
    const body = { id: 1, permission_name: 'updated' };
    mockRequest.mockResolvedValue({});
    await updatePermission(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/update', { method: 'PUT', data: body });
  });

  it('enablePermission', async () => {
    mockRequest.mockResolvedValue(undefined);
    await enablePermission(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/enable', { method: 'PUT', data: { id: 1 } });
  });

  it('disablePermission', async () => {
    mockRequest.mockResolvedValue(undefined);
    await disablePermission(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/disable', { method: 'PUT', data: { id: 1 } });
  });

  it('deletePermission', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deletePermission(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/permission/delete', { method: 'DELETE', data: { id: 1 } });
  });
});
