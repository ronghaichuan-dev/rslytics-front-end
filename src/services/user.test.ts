import { getUserList, createUser, updateUser, deleteUser, getUserDetail } from './user';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('user service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getUserList calls GET /admin/user/list with params', async () => {
    const params = { page: 1, size: 10, username: 'test' };
    mockRequest.mockResolvedValue({ total: 1, list: [{ id: 1, username: 'test' }] });
    const res = await getUserList(params);
    expect(mockRequest).toHaveBeenCalledWith('/admin/user/list', { params });
    expect(res.total).toBe(1);
  });

  it('createUser calls POST /admin/user/create', async () => {
    const body = { username: 'new', password: '123' };
    mockRequest.mockResolvedValue(undefined);
    await createUser(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/user/create', { method: 'POST', data: body });
  });

  it('updateUser calls PUT /admin/user/update', async () => {
    const body = { id: 1, username: 'updated' };
    mockRequest.mockResolvedValue(undefined);
    await updateUser(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/user/update', { method: 'PUT', data: body });
  });

  it('deleteUser calls DELETE /admin/user/delete', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteUser(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/user/delete', { method: 'DELETE', data: { id: 1 } });
  });

  it('getUserDetail calls GET /admin/user/detail', async () => {
    mockRequest.mockResolvedValue({ user: { id: 1, username: 'test' } });
    const res = await getUserDetail(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/user/detail', { params: { id: 1 } });
    expect(res.user.id).toBe(1);
  });
});
