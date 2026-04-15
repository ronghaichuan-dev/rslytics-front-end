import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['app:create', 'app:update', 'app:delete'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({ toolBarRender }: any) => (
    <div data-testid="pro-table">{toolBarRender?.()}</div>
  ),
}));

vi.mock('../../services/app', () => ({
  getAppList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createApp: vi.fn(),
  updateApp: vi.fn(),
  deleteApp: vi.fn(),
  getAppToken: vi.fn(),
  uploadFile: vi.fn(),
}));

vi.mock('../../services/dashboard', () => ({
  getAppSelectList: vi.fn().mockResolvedValue({ list: [] }),
}));

vi.mock('../../services/company', () => ({
  getCompanySelectList: vi.fn().mockResolvedValue({ list: [] }),
}));

vi.mock('../../services/event', () => ({
  getEventDropdown: vi.fn().mockResolvedValue({ list: [] }),
}));

import AppPage from './index';

describe('AppPage', () => {
  it('renders ProTable', () => {
    render(<AppPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
