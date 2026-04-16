import { getLocale, history, RequestConfig } from '@umijs/max';
import { message } from 'antd';
import RightContent from './components/RightContent';
import { TOKEN_KEY, getApiPrefix } from './constants';
import { decodeJWTPayload } from './utils/jwt';

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
    const prefix = getApiPrefix();
    const res = await fetch(
      `${prefix}/admin/permission/user-permissions?userId=${user_id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const json = await res.json();
    if (json?.code === 401) {
      localStorage.removeItem(TOKEN_KEY);
      history.push('/login');
      return {};
    }
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
      const prefix = getApiPrefix();
      if (config.url && !config.url.startsWith('http')) {
        config.url = prefix + config.url;
      }
      config.headers = {
        ...config.headers,
        'Accept-Language': getLocale(),
      };
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
    [
      (response: any) => {
        const res = response.data;
        if (res?.code === 401) {
          localStorage.removeItem(TOKEN_KEY);
          history.push('/login');
          return Promise.reject(new Error(res?.message ?? '登录已过期'));
        }
        if (res?.code !== 0) {
          const msg = res?.message ?? '服务器异常';
          message.error(msg);
          return Promise.reject(new Error(msg));
        }
        response.data = res.data;
        return response;
      },
      (error: any) => {
        message.error(error.message ?? '网络错误');
        return Promise.reject(error);
      },
    ],
  ],
};

export const layout = () => {
  return {
    logo: false,
    title: '归因数据管理系统',
    layout: 'mix',
    menu: {
      locale: true,
    },
    actionsRender: () => [<RightContent key="right" />],
  };
};
