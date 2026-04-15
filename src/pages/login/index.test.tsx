import { render, screen } from '@testing-library/react';

// Use vi.hoisted so mock fns are available before vi.mock hoisting
const { mockPush, mockSetInitialState } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSetInitialState: vi.fn(),
}));

vi.mock('@umijs/max', () => ({
  history: { push: mockPush },
  useModel: () => ({ setInitialState: mockSetInitialState }),
}));

vi.mock('../../services/auth', () => ({
  getCaptcha: vi.fn().mockResolvedValue({ id: '1', base64: 'ABCD' }),
  login: vi.fn().mockResolvedValue({ token: 'tok', expire_time: 3600 }),
}));

vi.mock('../../utils/jwt', () => ({
  decodeJWTPayload: vi.fn().mockReturnValue({ user_id: 1, username: 'admin' }),
}));

vi.mock('../../constants', () => ({ TOKEN_KEY: 'attrs_token' }));

import LoginPage from './index';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with username and password fields', () => {
    const { container } = render(<LoginPage />);
    expect(screen.getByText('归因数据管理系统')).toBeInTheDocument();
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    // Login button rendered by Ant Design
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
  });

  it('shows captcha after loading', async () => {
    render(<LoginPage />);
    expect(await screen.findByText('ABCD')).toBeInTheDocument();
  });
});
