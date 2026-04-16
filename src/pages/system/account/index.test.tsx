import { render, screen, waitFor } from '@testing-library/react';

const proTableSpy = vi.fn();

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['account:create', 'account:update', 'account:delete'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: (props: any) => {
    proTableSpy(props);
    return <div data-testid="pro-table">{props.toolBarRender?.()}</div>;
  },
}));

vi.mock('../../../services/account', () => ({
  getAccountList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock('../../../services/company', () => ({
  getCompanySelectList: vi.fn().mockResolvedValue({
    list: [{ id: 1, company_name: 'Test Company' }],
  }),
}));

vi.mock('../../../services/dashboard', () => ({
  getAppSelectList: vi.fn().mockResolvedValue({
    list: [{ app_id: 'app1', app_name: 'Test App' }],
  }),
}));

import AccountPage from './index';
import { entriesToObject, objectToEntries } from './index';

describe('AccountPage', () => {
  beforeEach(() => {
    proTableSpy.mockClear();
  });

  it('renders ProTable', () => {
    render(<AccountPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });

  it('renders app names in app column', async () => {
    render(<AccountPage />);

    await waitFor(() => expect(proTableSpy).toHaveBeenCalled());
    const columns = proTableSpy.mock.calls.at(-1)?.[0].columns ?? [];
    const appColumn = columns.find((column: any) => column.dataIndex === 'app_id');

    expect(
      appColumn.render(null, { app_id: ['app1', 'unknown-app'] }),
    ).toBe('Test App (app1), unknown-app');
  });

  it('converts account info object to editable entries', () => {
    expect(objectToEntries({ account: 'demo', extra: 123 })).toEqual([
      { key: 'account', value: 'demo' },
      { key: 'extra', value: '123' },
    ]);
  });

  it('converts key-value entries to json object for saving', () => {
    expect(
      entriesToObject([
        { key: 'account', value: 'demo' },
        { key: 'token', value: 'abc' },
        { key: '', value: '' },
      ]),
    ).toEqual({
      account: 'demo',
      token: 'abc',
    });
  });
});
