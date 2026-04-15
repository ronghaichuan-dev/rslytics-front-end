import { request } from '@umijs/max';

export interface Company {
  id: number;
  company_name: string;
  business_license: string;
  unified_credit_code: string;
  tax_rate?: number;
  creator: string;
  modifier: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyListParams {
  page: number;
  size: number;
  company_name?: string;
}

export interface CompanyListResult {
  total: number;
  list: Company[];
}

export async function getCompanyList(
  params: CompanyListParams,
): Promise<CompanyListResult> {
  return request('/admin/company/list', { params });
}

export async function createCompany(body: {
  company_name: string;
  business_license?: string;
  unified_credit_code?: string;
  tax_rate?: number;
}): Promise<void> {
  return request('/admin/company/create', { method: 'POST', data: body });
}

export async function updateCompany(body: {
  id: number;
  company_name?: string;
  business_license?: string;
  unified_credit_code?: string;
  tax_rate?: number;
}): Promise<void> {
  return request('/admin/company/update', { method: 'PUT', data: body });
}

export async function deleteCompany(id: number): Promise<void> {
  return request('/admin/company/delete', { method: 'DELETE', data: { id } });
}

export async function getCompanySelectList(): Promise<{ list: Company[] }> {
  return request('/admin/company/select/list');
}
