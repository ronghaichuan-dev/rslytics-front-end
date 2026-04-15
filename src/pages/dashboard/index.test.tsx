import { render, screen } from '@testing-library/react';

// Mock all dashboard services
vi.mock('../../services/dashboard', () => ({
  getDashboardAnalytics: vi.fn().mockResolvedValue({
    today_subscription_count: 10,
    month_subscription_count: 200,
    month_subscription_amount: 5000,
    total_subscription_amount: 99999,
  }),
  getAppSelectList: vi.fn().mockResolvedValue({ list: [{ app_id: 'a1', app_name: 'TestApp' }] }),
  getDailyTrend: vi.fn().mockResolvedValue({ trend_data: [] }),
  getRevenueSummary: vi.fn().mockResolvedValue({
    total_revenue: 1000, net_revenue: 900, refund_amount: 100,
    subscribe_count: 50, renew_count: 30, refund_count: 5,
    refund_rate: 0.1, renew_rate: 0.6, arpu: 20,
  }),
  getRevenueTrend: vi.fn().mockResolvedValue({ list: [] }),
  getRevenueByProduct: vi.fn().mockResolvedValue({ list: [] }),
  getChannelOverview: vi.fn().mockResolvedValue({ list: [] }),
  getCampaignAnalysis: vi.fn().mockResolvedValue({ list: [] }),
  getCountryRevenue: vi.fn().mockResolvedValue({ list: [] }),
  getLtvByChannel: vi.fn().mockResolvedValue({ list: [] }),
  getLtvCohort: vi.fn().mockResolvedValue({ list: [] }),
}));

// Mock ChartCard (uses echarts which is hard to render in jsdom)
vi.mock('../../components/ChartCard', () => ({
  default: ({ title }: { title: string }) => <div data-testid="chart-card">{title}</div>,
}));

import DashboardPage from './index';

describe('DashboardPage', () => {
  it('renders KPI cards', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText('今日订阅数')).toBeInTheDocument();
    expect(screen.getByText('本月订阅数')).toBeInTheDocument();
    expect(screen.getByText('本月收入')).toBeInTheDocument();
    expect(screen.getByText('总订阅收入')).toBeInTheDocument();
  });

  it('renders section titles', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText('每日订阅趋势')).toBeInTheDocument();
    expect(screen.getByText('产品维度收入')).toBeInTheDocument();
    expect(screen.getByText('渠道效果总览')).toBeInTheDocument();
    expect(screen.getByText('Campaign 分析')).toBeInTheDocument();
    expect(screen.getByText('国家收入分布')).toBeInTheDocument();
  });

  it('renders revenue summary when data available', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText('收入概览')).toBeInTheDocument();
    expect(screen.getAllByText('总收入').length).toBeGreaterThan(0);
    expect(screen.getByText('ARPU')).toBeInTheDocument();
  });
});
