import { getCompanyList, createCompany, updateCompany, deleteCompany, getCompanySelectList } from './company';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('company service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getCompanyList', async () => {
    mockRequest.mockResolvedValue({ total: 1, list: [] });
    await getCompanyList({ page: 1, size: 10 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/company/list', { params: { page: 1, size: 10 } });
  });

  it('createCompany', async () => {
    const body = { company_name: 'Test Co', tax_rate: 0.13 };
    mockRequest.mockResolvedValue(undefined);
    await createCompany(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/company/create', { method: 'POST', data: body });
  });

  it('updateCompany', async () => {
    const body = { id: 1, company_name: 'Updated', tax_rate: 0.06 };
    mockRequest.mockResolvedValue(undefined);
    await updateCompany(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/company/update', { method: 'PUT', data: body });
  });

  it('deleteCompany', async () => {
    mockRequest.mockResolvedValue(undefined);
    await deleteCompany(1);
    expect(mockRequest).toHaveBeenCalledWith('/admin/company/delete', { method: 'DELETE', data: { id: 1 } });
  });

  it('getCompanySelectList', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getCompanySelectList();
    expect(mockRequest).toHaveBeenCalledWith('/admin/company/select/list');
  });
});
