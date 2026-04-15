import { request } from '@umijs/max';

export interface Account {
  id: number;
  appid: string[];
  account_type: number;
  company_id: number;
  account_info: Record<string, unknown>;
  creator: string;
  modifier: string;
  created_at: string;
  updated_at: string;
}

export interface AccountListParams {
  page: number;
  size: number;
  account_type?: number;
  company_id?: number;
}

export interface AccountListResult {
  total: number;
  list: Account[];
}

interface RawAccount {
  id: number;
  appid: string | string[];
  account_type?: number;
  accountType?: number;
  company_id?: number;
  companyId?: number;
  account_info?: string | Record<string, unknown>;
  accountInfo?: string | Record<string, unknown>;
  creator: string;
  modifier: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

function parseJsonValue<T>(value: string | T | undefined, fallback: T): T {
  if (value == null || value === '') {
    return fallback;
  }
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeAccount(raw: RawAccount): Account {
  return {
    id: raw.id,
    appid: parseJsonValue<string[]>(raw.appid, []),
    account_type: raw.account_type ?? raw.accountType ?? 0,
    company_id: raw.company_id ?? raw.companyId ?? 0,
    account_info: parseJsonValue<Record<string, unknown>>(
      raw.account_info ?? raw.accountInfo,
      {},
    ),
    creator: raw.creator,
    modifier: raw.modifier,
    created_at: raw.created_at ?? raw.createdAt ?? '',
    updated_at: raw.updated_at ?? raw.updatedAt ?? '',
  };
}

export async function getAccountList(
  params: AccountListParams,
): Promise<AccountListResult> {
  const res = await request<{ total: number; list?: RawAccount[] }>(
    '/admin/account/list',
    { params },
  );
  return {
    total: res.total ?? 0,
    list: (res.list ?? []).map(normalizeAccount),
  };
}

export async function createAccount(body: {
  appid: string[];
  account_type: number;
  company_id: number;
  account_info?: Record<string, unknown>;
}): Promise<void> {
  return request('/admin/account/create', {
    method: 'POST',
    data: {
      ...body,
      appid: JSON.stringify(body.appid),
      account_info: body.account_info
        ? JSON.stringify(body.account_info)
        : '',
    },
  });
}

export async function updateAccount(body: {
  id: number;
  appid?: string[];
  account_type?: number;
  company_id?: number;
  account_info?: Record<string, unknown>;
}): Promise<void> {
  return request('/admin/account/update', {
    method: 'PUT',
    data: {
      ...body,
      appid: body.appid ? JSON.stringify(body.appid) : '',
      account_info: body.account_info
        ? JSON.stringify(body.account_info)
        : '',
    },
  });
}

export async function deleteAccount(id: number): Promise<void> {
  return request('/admin/account/delete', { method: 'DELETE', data: { id } });
}
