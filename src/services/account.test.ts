import { getAccountList, createAccount, updateAccount, deleteAccount } from './account';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('account service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getAccountList', async () => {
    mockRequest.mockResolvedValue({
      total: 1,
      list: [
        {
          id: 1,
          app_id: '["app1"]',
          accountType: 1,
          companyId: 2,
          accountInfo: '{"key":"value"}',
          creator: '1',
          modifier: '1',
          createdAt: '2026-03-27 10:00:00',
          updatedAt: '2026-03-27 10:00:00',
        },
      ],
    });
    const res = await getAccountList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/account/list', { params: { page: 1, size: 10 } });
    expect(res).toEqual({
      total: 1,
      list: [
        {
          id: 1,
          app_id: ['app1'],
          account_type: 1,
          company_id: 2,
          account_info: { key: 'value' },
          creator: '1',
          modifier: '1',
          created_at: '2026-03-27 10:00:00',
          updated_at: '2026-03-27 10:00:00',
        },
      ],
    });
  });

  it('createAccount', async () => {
    const body = { app_id: ['app1'], account_type: 1, company_id: 1, account_info: { key: 'value' } };
    mockRequest.mockResolvedValue(undefined);
    await createAccount(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/account/create', {
      method: 'POST',
      data: {
        ...body,
        app_id: '["app1"]',
        account_info: '{"key":"value"}',
      },
    });
  });

  it('updateAccount', async () => {
    const body = { id: 1, app_id: ['app2'], account_type: 2, company_id: 1, account_info: { token: 'abc' } };
    mockRequest.mockResolvedValue(undefined);
    await updateAccount(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/account/update', {
      method: 'PUT',
      data: {
        ...body,
        app_id: '["app2"]',
        account_info: '{"token":"abc"}',
      },
    });
  });

  it('deleteAccount', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteAccount(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/account/delete', { method: 'DELETE', data: { id: 1 } });
  });
});
