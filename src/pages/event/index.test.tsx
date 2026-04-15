import { render, screen } from '@testing-library/react';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
  useModel: () => ({ initialState: { permissionCodes: ['event:create', 'event:update', 'event:delete'] } }),
  useAccess: () => ({ can: () => true }),
}));

vi.mock('@ant-design/pro-components', () => ({
  ProTable: ({ toolBarRender }: any) => (
    <div data-testid="pro-table">{toolBarRender?.()}</div>
  ),
}));

vi.mock('../../services/event', () => ({
  getEventList: vi.fn().mockResolvedValue({ total: 0, list: [] }),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

import EventPage from './index';

describe('EventPage', () => {
  it('renders ProTable', () => {
    render(<EventPage />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
