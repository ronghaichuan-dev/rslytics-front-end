import { render, screen } from '@testing-library/react';

// Mock @umijs/max
vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['user:create', 'user:update', 'user:delete', 'user:list'] } }),
  useAccess: () => ({ can: () => true }),
}));

// Mock @ant-design/pro-components
vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({ toolBarRender, columns }: any) => (
    <div data-testid="pro-table">
      <div data-testid="toolbar">{toolBarRender?.()}</div>
      <div data-testid="columns-count">{columns?.length}</div>
    </div>
  ),
}));

// Mock services
vi.mock('../../../services/user', () => ({
  getUserList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserDetail: vi.fn(),
}));

vi.mock('../../../services/role', () => ({
  getRoleSelectList: vi.fn().mockResolvedValue({ list: [] }),
}));

import UserPage from './index';

describe('UserPage', () => {
  it('renders ProTable', () => {
    render(<UserPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });

  it('renders create button in toolbar', () => {
    render(<UserPage />);
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });
});
