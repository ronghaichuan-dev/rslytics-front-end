import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: () => <div data-testid="pro-table" />,
}));

vi.mock('../../services/subscription', () => ({
  getSubscriptionList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  getSubscriptionDetail: vi.fn().mockResolvedValue({ id: 1 }),
}));

import SubscriptionPage from './index';

describe('SubscriptionPage', () => {
  it('renders ProTable', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
