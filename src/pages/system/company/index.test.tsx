import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['company:create', 'company:update', 'company:delete'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({ toolBarRender }: any) => (
    <div data-testid="pro-table">{toolBarRender?.()}</div>
  ),
}));

vi.mock('../../../services/company', () => ({
  getCompanyList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}));

vi.mock('../../../services/app', () => ({
  uploadFile: vi.fn(),
}));

import CompanyPage from './index';

describe('CompanyPage', () => {
  it('renders ProTable', () => {
    render(<CompanyPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
