import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: () => <div data-testid="pro-table" />,
}));

vi.mock('../../../services/appEventLog', () => ({
  getAppEventLogList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  getAppEventLogDetail: vi.fn().mockResolvedValue({ event_log: {} }),
}));

import EventLogPage from './index';

describe('EventLogPage', () => {
  it('renders ProTable', () => {
    render(<EventLogPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
