import { getInitialState, request } from './app';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock('@umijs/max', () => ({
  history: { location: { pathname: '/' }, push: (...args: any[]) => mockPush(...args) },
  getLocale: () => 'zh-CN',
  RequestConfig: {},
}));

// Mock antd message
vi.mock('antd', () => ({ message: { error: vi.fn() } }));

describe('app.tsx - getInitialState', () => {
  beforeEach(() => {
    mockPush.mockReset();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns empty and redirects to /login when no token', async () => {
    const state = await getInitialState();
    expect(state).toEqual({});
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('returns empty when token has no user_id', async () => {
    const payload = { username: 'test' }; // no user_id
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    localStorage.setItem('attrs_token', token);
    const state = await getInitialState();
    expect(state).toEqual({});
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('fetches permissions and returns state with valid token', async () => {
    const payload = { user_id: 42, username: 'admin' };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    localStorage.setItem('attrs_token', token);

    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      status: 200,
      json: async () => ({ data: { permissionCodes: ['user:read', 'role:write'] } }),
    } as Response);

    const state = await getInitialState();
    expect(state.userId).toBe(42);
    expect(state.username).toBe('admin');
    expect(state.permissionCodes).toEqual(['user:read', 'role:write']);
    expect(mockFetch).toHaveBeenCalledWith(
      '/admin/permission/user-permissions?userId=42',
      expect.objectContaining({ headers: { Authorization: `Bearer ${token}` } }),
    );
  });

  it('clears token and redirects on business code 401', async () => {
    const payload = { user_id: 1, username: 'test' };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    localStorage.setItem('attrs_token', token);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      status: 200,
      json: async () => ({ code: 401, message: 'token 无效', data: null }),
    } as Response);

    const state = await getInitialState();
    expect(state).toEqual({});
    expect(localStorage.getItem('attrs_token')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});

describe('app.tsx - request interceptors', () => {
  it('requestInterceptor adds Authorization header when token exists', () => {
    localStorage.setItem('attrs_token', 'mytoken');
    const interceptor = request.requestInterceptors![0] as (config: any) => any;
    const config = { headers: {} };
    const result = interceptor(config);
    expect(result.headers.Authorization).toBe('Bearer mytoken');
    expect(result.headers['Accept-Language']).toBe('zh-CN');
  });

  it('requestInterceptor works without token', () => {
    localStorage.clear();
    const interceptor = request.requestInterceptors![0] as (config: any) => any;
    const config = { headers: {} };
    const result = interceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
    expect(result.headers['Accept-Language']).toBe('zh-CN');
  });

  it('responseInterceptor unwraps envelope on code 0', async () => {
    const [successHandler] = request.responseInterceptors![0] as [Function, Function];
    const response = { data: { code: 0, data: { id: 1 }, message: 'ok' } };
    const result = await successHandler(response);
    expect(result.data).toEqual({ id: 1 });
  });

  it('responseInterceptor rejects on non-zero code', async () => {
    const [successHandler] = request.responseInterceptors![0] as [Function, Function];
    const response = { data: { code: 1, data: null, message: '参数错误' } };
    await expect(successHandler(response)).rejects.toThrow('参数错误');
  });

  it('responseInterceptor handles business code 401', async () => {
    localStorage.setItem('attrs_token', 'tok');
    const [successHandler] = request.responseInterceptors![0] as [Function, Function];
    const response = { data: { code: 401, message: 'token 已过期', data: null } };
    await expect(successHandler(response)).rejects.toThrow('token 已过期');
    expect(localStorage.getItem('attrs_token')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
