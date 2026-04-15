import { getCaptcha, login, logout } from './auth';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('auth service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getCaptcha calls GET /admin/captcha', async () => {
    mockRequest.mockResolvedValue({ id: '1', base64: 'img' });
    const res = await getCaptcha();
    expect(mockRequest).toHaveBeenCalledWith('/admin/captcha');
    expect(res).toEqual({ id: '1', base64: 'img' });
  });

  it('login calls POST /admin/login with body', async () => {
    const body = { username: 'admin', password: '123', captcha: 'abc', captcha_id: '1' };
    mockRequest.mockResolvedValue({ token: 'tok', expire_time: 3600 });
    const res = await login(body);
    expect(mockRequest).toHaveBeenCalledWith('/admin/login', { method: 'POST', data: body });
    expect(res.token).toBe('tok');
  });

  it('logout calls POST /admin/logout', async () => {
    mockRequest.mockResolvedValue({ success: true });
    await logout();
    expect(mockRequest).toHaveBeenCalledWith('/admin/logout', { method: 'POST' });
  });
});
