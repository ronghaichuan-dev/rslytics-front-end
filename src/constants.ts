export const TOKEN_KEY = 'attrs_token';
export const DEFAULT_NAME = 'Umi';

export const ENV_KEY = 'attrs_env';

export const ENV_CONFIG = {
  local: { label: '本地', prefix: '/api-local' },
  test: { label: '测试', prefix: '/api-test' },
  prod: { label: '生产', prefix: '/api-prod' },
} as const;

export type EnvType = keyof typeof ENV_CONFIG;

export function getCurrentEnv(): EnvType {
  const env = localStorage.getItem(ENV_KEY) as EnvType | null;
  return env && env in ENV_CONFIG ? env : 'local';
}

export function getApiPrefix(): string {
  return ENV_CONFIG[getCurrentEnv()].prefix;
}
