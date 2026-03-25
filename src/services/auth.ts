import { request } from '@umijs/max';

export const TOKEN_KEY = 'attrs_token';

/** GET /admin/captcha → { id, base64 } */
export async function getCaptcha(): Promise<{ id: string; base64: string }> {
  return request('/admin/captcha');
}

/** POST /admin/login */
export async function login(body: {
  username: string;
  password: string;
  captcha?: string;
  captcha_id?: string;
}): Promise<{ token: string; expire_time: number }> {
  return request('/admin/login', {
    method: 'POST',
    data: body,
  });
}

/** POST /admin/logout */
export async function logout(): Promise<{ success: boolean }> {
  return request('/admin/logout', { method: 'POST' });
}
