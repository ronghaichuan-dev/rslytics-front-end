import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AccessButton from './index';

vi.mock('@umijs/max', () => ({
  useAccess: vi.fn(),
}));

import { useAccess } from '@umijs/max';

describe('AccessButton', () => {
  it('renders children when permission is granted', () => {
    (useAccess as any).mockReturnValue({ can: () => true });
    render(<AccessButton permissionCode="user:create">New User</AccessButton>);
    expect(screen.getByText('New User')).toBeInTheDocument();
  });

  it('renders nothing when permission is denied', () => {
    (useAccess as any).mockReturnValue({ can: () => false });
    const { container } = render(
      <AccessButton permissionCode="user:create">New User</AccessButton>,
    );
    expect(container.firstChild).toBeNull();
  });
});
