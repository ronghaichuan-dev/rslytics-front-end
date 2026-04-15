import { getNotificationList } from './notification';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('notification service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getNotificationList uses pageSize param', async () => {
    mockRequest.mockResolvedValue({ total: 5, list: [] });
    const params = { page: 1, pageSize: 20, noticeType: 'alert' };
    await getNotificationList(params);
    expect(mockRequest).toHaveBeenCalledWith('/admin/notification/list', { params });
  });
});
