import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['role:create', 'role:update', 'role:delete', 'role:assign'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({ toolBarRender }: any) => (
    <div data-testid="pro-table">
      <div data-testid="toolbar">{toolBarRender?.()}</div>
    </div>
  ),
}));

vi.mock('../../../services/role', () => ({
  getRoleList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  updateRoleStatus: vi.fn(),
  deleteRole: vi.fn(),
}));

vi.mock('../../../services/permission', () => ({
  getPermissionTree: vi.fn().mockResolvedValue({ tree: [] }),
}));

vi.mock('../../../services/rolePermission', () => ({
  assignRolePermissions: vi.fn(),
  getRolePermissions: vi.fn().mockResolvedValue({ permissions: [] }),
}));

import RolePage from './index';

describe('RolePage', () => {
  it('renders ProTable', () => {
    render(<RolePage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
