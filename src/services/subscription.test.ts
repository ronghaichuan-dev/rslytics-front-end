import { getSubscriptionList, getSubscriptionDetail, createSubscription, updateSubscription, deleteSubscription } from './subscription';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('subscription service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getSubscriptionList', async () => {
    mockRequest.mockResolvedValue({ total: 0, list: [] });
    await getSubscriptionList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/subscription/list', { params: { page: 1, size: 10 } });
  });

  it('getSubscriptionDetail', async () => {
    mockRequest.mockResolvedValue({ id: 1, app_id: 'a1' });
    const res = await getSubscriptionDetail(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/subscription/detail', { params: { id: 1 } });
    expect(res.id).toBe(1);
  });

  it('createSubscription', async () => {
    const body = { app_id: 'a1', event_id: 1 };
    mockRequest.mockResolvedValue({ id: 1 });
    await createSubscription(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/subscription/create', { method: 'POST', data: body });
  });

  it('updateSubscription', async () => {
    const body = { id: 1, country: 'US' };
    mockRequest.mockResolvedValue({});
    await updateSubscription(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/subscription/update', { method: 'PUT', data: body });
  });

  it('deleteSubscription', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteSubscription(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/subscription/delete', { method: 'DELETE', data: { id: 1 } });
  });
});
