import { history, RequestConfig } from '@umijs/max';
import { message } from 'antd';

export const TOKEN_KEY = 'attrs_token';

/** Decode JWT payload without verification (client-side only) */
export function decodeJWTPayload(token: string): {
  user_id?: number;
  username?: string;
} {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

export async function getInitialState(): Promise<{
  userId?: number;
  username?: string;
  permissionCodes?: string[];
}> {
  if (history.location.pathname === '/login') return {};
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      history.push('/login');
      return {};
    }
    const { user_id, username } = decodeJWTPayload(token);
    if (!user_id) {
      history.push('/login');
      return {};
    }
    // Fetch permission codes for this user
    const res = await fetch(
      `/admin/permission/user-permissions?userId=${user_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      history.push('/login');
      return {};
    }
    const json = await res.json();
    const permissionCodes: string[] = json?.data?.permissionCodes ?? [];
    return { userId: user_id, username, permissionCodes };
  } catch {
    history.push('/login');
    return {};
  }
}

export const request: RequestConfig = {
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      const res = response.data;
      if (res?.code !== 0) {
        const msg = res?.message ?? '服务器异常';
        message.error(msg);
        return Promise.reject(new Error(msg));
      }
      response.data = res.data;
      return response;
    },
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        history.push('/login');
        return;
      }
      message.error(error.message ?? '网络错误');
      return Promise.reject(error);
    },
  ],
};

export const layout = () => {
  return {
    logo: false,
    title: '归因数据管理系统',
    menu: {
      locale: true,
    },
  };
};
