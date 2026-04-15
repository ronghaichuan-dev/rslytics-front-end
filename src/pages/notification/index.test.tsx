import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: () => <div data-testid="pro-table" />,
}));

vi.mock('../../services/notification', () => ({
  getNotificationList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
}));

import NotificationPage from './index';

describe('NotificationPage', () => {
  it('renders ProTable', () => {
    render(<NotificationPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
