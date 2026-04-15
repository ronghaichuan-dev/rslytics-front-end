import { request } from '@umijs/max';

export interface DashboardAnalytics {
  today_subscription_count: number;
  month_subscription_count: number;
  month_subscription_amount: number;
  total_subscription_amount: number;
}

export interface DailyTrendItem {
  app_id: string;
  date: string;
  count: number;
  amount: number;
}

export interface RevenueSummary {
  total_revenue: number;
  net_revenue: number;
  refund_amount: number;
  subscribe_count: number;
  renew_count: number;
  refund_count: number;
  refund_rate: number;
  renew_rate: number;
  arpu: number;
}

export interface RevenueTrendItem {
  period: string;
  revenue: number;
  net_revenue: number;
  subscribe_count: number;
  refund_count: number;
}

export interface RevenueByProductItem {
  product_id: string;
  subscribe_count: number;
  revenue: number;
  percentage: number;
}

export interface ChannelOverviewItem {
  tracker_network: string;
  install_count: number;
  trial_count: number;
  subscribe_count: number;
  renew_count: number;
  refund_count: number;
  revenue: number;
  net_revenue: number;
  install_to_trial_rate: number;
  trial_to_paid_rate: number;
}

export interface CampaignAnalysisItem {
  campaign_id: string;
  tracker_network: string;
  install_count: number;
  subscribe_count: number;
  revenue: number;
  net_revenue: number;
}

export interface CountryRevenueItem {
  country: string;
  install_count: number;
  subscribe_count: number;
  revenue: number;
  net_revenue: number;
}

export interface LtvByChannelItem {
  tracker_network: string;
  install_count: number;
  paid_user_count: number;
  total_revenue: number;
  ltv: number;
  paid_rate: number;
}

export interface LtvCohortItem {
  cohort_date: string;
  install_count: number;
  d7_ltv: number;
  d30_ltv: number;
  d60_ltv: number;
  d90_ltv: number;
}

export async function getDashboardAnalytics(params: {
  app_ids?: string;
}): Promise<DashboardAnalytics> {
  return request('/admin/dashboard/analytics', { params });
}

export async function getAppSelectList(): Promise<{
  list: { app_id: string; app_name: string }[];
}> {
  return request('/admin/dashboard/app/select/list');
}

export async function getDailyTrend(params: {
  app_ids?: string;
  days?: number;
}): Promise<{ trend_data: DailyTrendItem[] }> {
  return request('/admin/dashboard/app/daily/trend', { params });
}

export async function getRevenueSummary(params: {
  app_ids?: string;
  start_date?: string;
  end_date?: string;
}): Promise<RevenueSummary> {
  return request('/admin/dashboard/revenue/summary', { params });
}

export async function getRevenueTrend(params: {
  app_ids?: string;
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}): Promise<{ list: RevenueTrendItem[] }> {
  return request('/admin/dashboard/revenue/trend', { params });
}

export async function getRevenueByProduct(params: {
  app_ids?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ list: RevenueByProductItem[] }> {
  return request('/admin/dashboard/revenue/by-product', { params });
}

export async function getChannelOverview(params: {
  app_ids?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ list: ChannelOverviewItem[] }> {
  return request('/admin/dashboard/channel/overview', { params });
}

export async function getCampaignAnalysis(params: {
  app_ids?: string;
  tracker_network?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ list: CampaignAnalysisItem[] }> {
  return request('/admin/dashboard/campaign/analysis', { params });
}

export async function getCountryRevenue(params: {
  app_ids?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ list: CountryRevenueItem[] }> {
  return request('/admin/dashboard/country/revenue', { params });
}

export async function getLtvByChannel(params: {
  app_ids?: string;
  install_start_date?: string;
  install_end_date?: string;
}): Promise<{ list: LtvByChannelItem[] }> {
  return request('/admin/dashboard/ltv/by-channel', { params });
}

export async function getLtvCohort(params: {
  app_ids?: string;
  start_date?: string;
  end_date?: string;
  cohort_type?: 'day' | 'week' | 'month';
}): Promise<{ list: LtvCohortItem[] }> {
  return request('/admin/dashboard/ltv/cohort', { params });
}
