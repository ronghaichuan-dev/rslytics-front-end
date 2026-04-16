import { request } from '@umijs/max';

// ===== 通用类型 =====

export interface CompareValue {
  current: number;
  compare?: number;
  change_rate?: number;
}

export interface CompareIntValue {
  current: number;
  compare?: number;
  change_rate?: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}

// ===== 通用请求参数 =====

export interface AnalyticsBaseParams {
  app_ids?: string;
  timezone?: string;
  start_date: string;
  end_date: string;
  compare_start_date?: string;
  compare_end_date?: string;
  countries?: string;
}

// ===== 概览 =====

export interface OverviewKpiData {
  install_count: CompareIntValue;
  trial_count: CompareIntValue;
  subscribe_count: CompareIntValue;
  net_revenue: CompareValue;
  data_updated_at: string;
}

export interface OverviewTrendData {
  current: TrendPoint[];
  compare?: TrendPoint[];
}

export interface ChannelShareItem {
  tracker_network: string;
  install_count: number;
  percentage: number;
}

// ===== 渠道分析 =====

export interface ChannelKpiData {
  install_count: CompareIntValue;
  trial_count: CompareIntValue;
  subscribe_count: CompareIntValue;
  net_revenue: CompareValue;
  install_to_paid_rate: CompareValue;
}

export interface ChannelTrendSeries {
  tracker_network: string;
  points: TrendPoint[];
}

export interface ChannelListItem {
  id: string;
  name: string;
  has_children: boolean;
  install_count: CompareIntValue;
  trial_count: CompareIntValue;
  subscribe_count: CompareIntValue;
  net_revenue: CompareValue;
  children?: ChannelListItem[];
}

export interface ChannelListData {
  list: ChannelListItem[];
  total: ChannelListItem;
}

// ===== API 调用 =====

export async function getOverviewKpi(
  params: AnalyticsBaseParams,
): Promise<OverviewKpiData> {
  return request('/admin/analytics/overview/kpi', { params });
}

export async function getOverviewTrend(
  params: AnalyticsBaseParams & { metric?: string },
): Promise<OverviewTrendData> {
  return request('/admin/analytics/overview/trend', { params });
}

export async function getOverviewChannelShare(params: {
  app_ids?: string;
  start_date: string;
  end_date: string;
  countries?: string;
}): Promise<{ list: ChannelShareItem[] }> {
  return request('/admin/analytics/overview/channel-share', { params });
}

export async function getChannelKpi(
  params: AnalyticsBaseParams,
): Promise<ChannelKpiData> {
  return request('/admin/analytics/channel/kpi', { params });
}

export async function getChannelTrend(params: {
  app_ids?: string;
  start_date: string;
  end_date: string;
  countries?: string;
  metric?: string;
}): Promise<{ series: ChannelTrendSeries[] }> {
  return request('/admin/analytics/channel/trend', { params });
}

export async function getChannelList(
  params: AnalyticsBaseParams & {
    level?: string;
    parent_id?: string;
    sort_field?: string;
    sort_order?: string;
  },
): Promise<ChannelListData> {
  return request('/admin/analytics/channel/list', { params });
}

export async function getCountryOptions(params: {
  app_ids?: string;
}): Promise<{ list: string[] }> {
  return request('/admin/analytics/country/options', { params });
}

export function exportChannelListUrl(params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return `/admin/analytics/channel/list/export?${query}`;
}

// ===== P1: 活动分析 =====

export interface CampaignListItem {
  campaign_id: string;
  tracker_network: string;
  install_count: CompareIntValue;
  trial_count: CompareIntValue;
  subscribe_count: CompareIntValue;
  net_revenue: CompareValue;
  install_to_paid_rate: CompareValue;
}

export interface CampaignListData {
  list: CampaignListItem[];
  total: number;
}

export async function getCampaignList(
  params: AnalyticsBaseParams & {
    tracker_network?: string;
    keyword?: string;
    tab?: string;
    sort_field?: string;
    sort_order?: string;
    page?: number;
    page_size?: number;
  },
): Promise<CampaignListData> {
  return request('/admin/analytics/campaign/list', { params });
}

// ===== P1: 地理分析 =====

export interface GeoMapItem {
  country: string;
  value: number;
}

export interface GeoTopItem {
  country: string;
  value: CompareValue;
}

export interface GeoListItem {
  country: string;
  install_count: CompareIntValue;
  trial_count: CompareIntValue;
  subscribe_count: CompareIntValue;
  net_revenue: CompareValue;
  arpu: CompareValue;
  refund_rate: CompareValue;
}

export interface GeoListData {
  list: GeoListItem[];
  total: GeoListItem;
}

export async function getGeoMap(params: {
  app_ids?: string;
  start_date: string;
  end_date: string;
  tracker_network?: string;
  metric?: string;
}): Promise<{ list: GeoMapItem[] }> {
  return request('/admin/analytics/geo/map', { params });
}

export async function getGeoTop(
  params: AnalyticsBaseParams & {
    tracker_network?: string;
    metric?: string;
    limit?: number;
  },
): Promise<{ list: GeoTopItem[] }> {
  return request('/admin/analytics/geo/top', { params });
}

export async function getGeoList(
  params: AnalyticsBaseParams & {
    tracker_network?: string;
    sort_field?: string;
    sort_order?: string;
  },
): Promise<GeoListData> {
  return request('/admin/analytics/geo/list', { params });
}

// ===== P1: 订阅漏斗 =====

export interface FunnelOverviewData {
  install_count: CompareIntValue;
  trial_count: CompareIntValue;
  subscribe_count: CompareIntValue;
  renew_count: CompareIntValue;
  refund_count: CompareIntValue;
  install_to_trial_rate: CompareValue;
  trial_to_paid_rate: CompareValue;
  paid_to_renew_rate: CompareValue;
  renew_to_refund_rate: CompareValue;
  install_to_paid_rate: CompareValue;
  net_retention: CompareIntValue;
}

export interface FunnelReasonItem {
  reason: number;
  reason_name: string;
  count: number;
}

export interface FunnelStatusItem {
  status: number;
  status_name: string;
  count: number;
}

export interface FunnelStatusData {
  list: FunnelStatusItem[];
  auto_renew_enabled: number;
  auto_renew_total: number;
  auto_renew_rate: number;
}

export interface FunnelBreakdownItem {
  name: string;
  install_count: number;
  trial_count: number;
  subscribe_count: number;
  renew_count: number;
  refund_count: number;
  install_to_trial_rate: number;
  trial_to_paid_rate: number;
  renew_rate: number;
  refund_rate: number;
  install_to_paid_rate: number;
}

export async function getFunnelOverview(
  params: AnalyticsBaseParams,
): Promise<FunnelOverviewData> {
  return request('/admin/analytics/funnel/overview', { params });
}

export async function getFunnelReasons(params: {
  app_ids?: string;
}): Promise<{ list: FunnelReasonItem[] }> {
  return request('/admin/analytics/funnel/reasons', { params });
}

export async function getFunnelStatus(params: {
  app_ids?: string;
}): Promise<FunnelStatusData> {
  return request('/admin/analytics/funnel/status', { params });
}

export async function getFunnelBreakdown(params: {
  app_ids?: string;
  start_date: string;
  end_date: string;
  countries?: string;
  dimension?: string;
  sort_field?: string;
  sort_order?: string;
}): Promise<{ list: FunnelBreakdownItem[] }> {
  return request('/admin/analytics/funnel/breakdown', { params });
}

// ===== P2: Cohort & LTV 分析 =====

export interface CohortBaseParams {
  app_ids?: string;
  timezone?: string;
  start_date: string;
  end_date: string;
  countries?: string;
  tracker_network?: string;
  granularity?: string;
}

export interface LtvCurvePoint {
  day: number;
  value: number;
}

export interface LtvCurveLine {
  name: string;
  data_points: LtvCurvePoint[];
}

export interface LtvCurveData {
  lines: LtvCurveLine[];
}

export interface HeatmapRow {
  cohort_date: string;
  install_count: number;
  values: (number | null)[];
}

export interface HeatmapData {
  days: number[];
  rows: HeatmapRow[];
}

export interface CohortKpiData {
  avg_d7_ltv: CompareValue;
  avg_d30_ltv: CompareValue;
  avg_d90_ltv: CompareValue;
  total_install: CompareIntValue;
  total_revenue: CompareValue;
}

export async function getCohortLtvCurve(
  params: CohortBaseParams & {
    group_by?: string;
    metric?: string;
    days?: string;
  },
): Promise<LtvCurveData> {
  return request('/admin/analytics/cohort/ltv-curve', { params });
}

export async function getCohortHeatmap(
  params: CohortBaseParams & {
    metric?: string;
    days?: string;
  },
): Promise<HeatmapData> {
  return request('/admin/analytics/cohort/heatmap', { params });
}

export function exportCohortHeatmapUrl(params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return `/admin/analytics/cohort/heatmap/export?${query}`;
}

export async function getCohortKpi(
  params: CohortBaseParams & {
    compare_start_date?: string;
    compare_end_date?: string;
  },
): Promise<CohortKpiData> {
  return request('/admin/analytics/cohort/kpi', { params });
}

// ===== P2: 自定义报表 =====

export interface CustomQueryParams {
  app_ids?: string;
  timezone?: string;
  start_date: string;
  end_date: string;
  compare_start_date?: string;
  compare_end_date?: string;
  dimensions: string[];
  metrics: string[];
  sort_field?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}

export interface CustomQueryData {
  columns: string[];
  rows: Record<string, any>[];
  total: Record<string, any>;
  page: number;
  page_size: number;
  total_count: number;
}

export async function getCustomQuery(
  data: CustomQueryParams,
): Promise<CustomQueryData> {
  return request('/admin/analytics/custom/query', { method: 'POST', data });
}

export async function exportCustomQuery(
  data: Omit<CustomQueryParams, 'page' | 'page_size'>,
): Promise<Blob> {
  return request('/admin/analytics/custom/query/export', {
    method: 'POST',
    data,
    responseType: 'blob',
  });
}

export interface CustomTemplateItem {
  id: number;
  name: string;
  app_id: string;
  dimensions: string[];
  metrics: string[];
  is_preset: number;
  created_by: number;
}

export async function getCustomTemplates(params?: {
  app_ids?: string;
}): Promise<{ list: CustomTemplateItem[] }> {
  return request('/admin/analytics/custom/templates', { params });
}

export async function saveCustomTemplate(data: {
  id?: number;
  name: string;
  app_id?: string;
  dimensions: string[];
  metrics: string[];
}): Promise<{ id: number }> {
  return request('/admin/analytics/custom/templates', { method: 'POST', data });
}

export async function deleteCustomTemplate(data: {
  id: number;
}): Promise<void> {
  return request('/admin/analytics/custom/templates', { method: 'DELETE', data });
}
