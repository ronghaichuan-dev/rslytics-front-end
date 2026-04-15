import { getEventList, getEventDropdown, createEvent, updateEvent, deleteEvent } from './event';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('event service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getEventList', async () => {
    mockRequest.mockResolvedValue({ total: 0, list: [] });
    await getEventList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/event/list', { params: { page: 1, size: 10 } });
  });

  it('getEventDropdown', async () => {
    mockRequest.mockResolvedValue({ list: [{ id: 1, event_name: 'purchase' }] });
    const res = await getEventDropdown();
    expect(mockRequest).toHaveBeenCalledWith('/admin/event/dropdown');
    expect(res.list).toHaveLength(1);
  });

  it('createEvent', async () => {
    const body = { event_name: 'signup' };
    mockRequest.mockResolvedValue({ id: 1, event_name: 'signup' });
    await createEvent(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/event/create', { method: 'POST', data: body });
  });

  it('updateEvent', async () => {
    const body = { id: 1, event_name: 'updated' };
    mockRequest.mockResolvedValue({});
    await updateEvent(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/event/update', { method: 'PUT', data: body });
  });

  it('deleteEvent', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteEvent(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/event/delete', { method: 'DELETE', data: { id: 1 } });
  });
});
