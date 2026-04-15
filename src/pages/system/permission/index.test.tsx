import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['permission:create', 'permission:update', 'permission:delete'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('../../../services/permission', () => ({
  getPermissionTree: vi.fn().mockResolvedValue({ tree: [] }),
  createPermission: vi.fn(),
  updatePermission: vi.fn(),
  enablePermission: vi.fn(),
  disablePermission: vi.fn(),
  deletePermission: vi.fn(),
}));

import PermissionPage from './index';

describe('PermissionPage', () => {
  it('renders create button', async () => {
    render(<PermissionPage />);
    expect(screen.getByText('common.create')).toBeInTheDocument();
  });

  it('renders permission table columns header labels', () => {
    render(<PermissionPage />);
    expect(screen.getByText('权限名称')).toBeInTheDocument();
    expect(screen.getByText('权限码')).toBeInTheDocument();
    expect(screen.getByText('模块')).toBeInTheDocument();
  });
});
