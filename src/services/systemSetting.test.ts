import { getSystemSettingList, createSystemSetting, updateSystemSetting, deleteSystemSetting } from './systemSetting';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('systemSetting service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getSystemSettingList', async () => {
    mockRequest.mockResolvedValue({ total: 0, list: [] });
    await getSystemSettingList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/system-setting/list', { params: { page: 1, size: 10 } });
  });

  it('createSystemSetting', async () => {
    const body = { key: 'theme', value: 'dark' };
    mockRequest.mockResolvedValue(undefined);
    await createSystemSetting(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/system-setting/create', { method: 'POST', data: body });
  });

  it('updateSystemSetting', async () => {
    const body = { id: 1, value: 'light' };
    mockRequest.mockResolvedValue(undefined);
    await updateSystemSetting(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/system-setting/update', { method: 'PUT', data: body });
  });

  it('deleteSystemSetting', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteSystemSetting(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/system-setting/delete', { method: 'DELETE', data: { id: 1 } });
  });
});
