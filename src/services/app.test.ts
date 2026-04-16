import { getAppList, createApp, updateApp, deleteApp, getAppSubscriptionTrend, getAppToken, uploadFile } from './app';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('app service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getAppList', async () => {
    mockRequest.mockResolvedValue({ total: 1, list: [] });
    await getAppList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/app/list', { params: { page: 1, size: 10 } });
  });

  it('createApp', async () => {
    const body = { app_id: 'app1', app_name: 'MyApp', company_id: 1 };
    mockRequest.mockResolvedValue(undefined);
    await createApp(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/app/create', { method: 'POST', data: body });
  });

  it('updateApp', async () => {
    const body = { app_id: 'app1', company_id: 2, app_name: 'Updated' };
    mockRequest.mockResolvedValue(undefined);
    await updateApp(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/app/update', { method: 'PUT', data: body });
  });

  it('deleteApp', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteApp('app1');
    expect(mockRequest).toHaveBeenCalledWith('/admin/app/delete', { method: 'DELETE', data: { app_id: 'app1' } });
  });

  it('getAppSubscriptionTrend', async () => {
    mockRequest.mockResolvedValue({ trend: [] });
    await getAppSubscriptionTrend('app1');
    expect(mockRequest).toHaveBeenCalledWith('/admin/app/subscription/trend', { params: { app_id: 'app1' } });
  });

  it('getAppToken', async () => {
    mockRequest.mockResolvedValue({ app_token: 'abc123' });
    const res = await getAppToken('app1');
    expect(mockRequest).toHaveBeenCalledWith('/admin/app/token', { params: { app_id: 'app1' } });
    expect(res.app_token).toBe('abc123');
  });

  it('uploadFile sends FormData', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    mockRequest.mockResolvedValue({ url: '/uploads/test.png' });
    await uploadFile(file);
    expect(mockRequest).toHaveBeenCalledWith('/admin/upload/upload/image', {
      method: 'POST',
      data: expect.any(FormData),
    });
  });
});
