import { getAppEventLogList, getAppEventLogDetail } from './appEventLog';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('appEventLog service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getAppEventLogList', async () => {
    mockRequest.mockResolvedValue({ total: 0, list: [] });
    await getAppEventLogList({ page: 1, size: 20, appid: 'app1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/app-event-log/list', { params: { page: 1, size: 20, appid: 'app1' } });
  });

  it('getAppEventLogDetail', async () => {
    mockRequest.mockResolvedValue({ event_log: { id: 1 } });
    const res = await getAppEventLogDetail(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/app-event-log/detail', { params: { id: 1 } });
    expect(res.event_log.id).toBe(1);
  });
});
