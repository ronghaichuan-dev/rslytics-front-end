import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['setting:create', 'setting:update', 'setting:delete'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({ toolBarRender }: any) => (
    <div data-testid="pro-table">{toolBarRender?.()}</div>
  ),
}));

vi.mock('../../services/systemSetting', () => ({
  getSystemSettingList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createSystemSetting: vi.fn(),
  updateSystemSetting: vi.fn(),
  deleteSystemSetting: vi.fn(),
}));

import SettingsPage from './index';

describe('SettingsPage', () => {
  it('renders ProTable', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
