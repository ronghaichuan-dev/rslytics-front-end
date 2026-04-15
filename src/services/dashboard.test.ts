import {
  getDashboardAnalytics, getAppSelectList, getDailyTrend,
  getRevenueSummary, getRevenueTrend, getRevenueByProduct,
  getChannelOverview, getCampaignAnalysis, getCountryRevenue,
  getLtvByChannel, getLtvCohort,
} from './dashboard';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({ request: (...args: any[]) => mockRequest(...args) }));

describe('dashboard service', () => {
  beforeEach(() => mockRequest.mockReset());

  it('getDashboardAnalytics', async () => {
    mockRequest.mockResolvedValue({ today_subscription_count: 10 });
    await getDashboardAnalytics({ app_ids: 'a1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/analytics', { params: { app_ids: 'a1' } });
  });

  it('getAppSelectList', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getAppSelectList();
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/app/select/list');
  });

  it('getDailyTrend', async () => {
    mockRequest.mockResolvedValue({ trend_data: [] });
    await getDailyTrend({ app_ids: 'a1', days: 7 });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/app/daily/trend', { params: { app_ids: 'a1', days: 7 } });
  });

  it('getRevenueSummary', async () => {
    mockRequest.mockResolvedValue({ total_revenue: 100 });
    await getRevenueSummary({ app_ids: 'a1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/revenue/summary', { params: { app_ids: 'a1' } });
  });

  it('getRevenueTrend', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getRevenueTrend({ app_ids: 'a1', group_by: 'day' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/revenue/trend', { params: { app_ids: 'a1', group_by: 'day' } });
  });

  it('getRevenueByProduct', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getRevenueByProduct({ app_ids: 'a1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/revenue/by-product', { params: { app_ids: 'a1' } });
  });

  it('getChannelOverview', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getChannelOverview({ app_ids: 'a1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/channel/overview', { params: { app_ids: 'a1' } });
  });

  it('getCampaignAnalysis', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getCampaignAnalysis({ app_ids: 'a1', tracker_network: 'fb' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/campaign/analysis', { params: { app_ids: 'a1', tracker_network: 'fb' } });
  });

  it('getCountryRevenue', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getCountryRevenue({ app_ids: 'a1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/country/revenue', { params: { app_ids: 'a1' } });
  });

  it('getLtvByChannel', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getLtvByChannel({ app_ids: 'a1' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/ltv/by-channel', { params: { app_ids: 'a1' } });
  });

  it('getLtvCohort', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getLtvCohort({ app_ids: 'a1', cohort_type: 'month' });
    expect(mockRequest).toHaveBeenCalledWith('/admin/dashboard/ltv/cohort', { params: { app_ids: 'a1', cohort_type: 'month' } });
  });
});
