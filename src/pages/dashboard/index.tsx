import {
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Statistic,
  Table,
  Tabs,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import ChartCard from '../../components/ChartCard';
import {
  getAppSelectList,
  getCampaignAnalysis,
  getChannelOverview,
  getCountryRevenue,
  getDailyTrend,
  getDashboardAnalytics,
  getLtvByChannel,
  getLtvCohort,
  getRevenueByProduct,
  getRevenueSummary,
  getRevenueTrend,
  type CampaignAnalysisItem,
  type ChannelOverviewItem,
  type CountryRevenueItem,
  type DailyTrendItem,
  type LtvByChannelItem,
  type LtvCohortItem,
  type RevenueByProductItem,
  type RevenueSummary,
  type RevenueTrendItem,
} from '../../services/dashboard';

const { RangePicker } = DatePicker;

const defaultRange: [Dayjs, Dayjs] = [dayjs().subtract(29, 'day'), dayjs()];

function formatDate(d: Dayjs) {
  return d.format('YYYY-MM-DD');
}

export default function DashboardPage() {
  const [appOptions, setAppOptions] = useState<
    { app_id: string; app_name: string }[]
  >([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(defaultRange);
  const [trendDays, setTrendDays] = useState(30);

  const [analytics, setAnalytics] = useState<any>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(
    null,
  );
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [revenueGroupBy, setRevenueGroupBy] = useState<
    'day' | 'week' | 'month'
  >('day');
  const [revenueByProduct, setRevenueByProduct] = useState<
    RevenueByProductItem[]
  >([]);
  const [channelOverview, setChannelOverview] = useState<ChannelOverviewItem[]>(
    [],
  );
  const [campaignData, setCampaignData] = useState<CampaignAnalysisItem[]>([]);
  const [countryRevenue, setCountryRevenue] = useState<CountryRevenueItem[]>(
    [],
  );

  const [ltvInstallRange, setLtvInstallRange] =
    useState<[Dayjs, Dayjs]>(defaultRange);
  const [ltvByChannel, setLtvByChannel] = useState<LtvByChannelItem[]>([]);
  const [ltvCohort, setLtvCohort] = useState<LtvCohortItem[]>([]);
  const [cohortType, setCohortType] = useState<'day' | 'week' | 'month'>('day');

  const appIds = selectedApps.join(',');
  const startDate = formatDate(dateRange[0]);
  const endDate = formatDate(dateRange[1]);

  useEffect(() => {
    getAppSelectList()
      .then((res) => setAppOptions(res.list ?? []))
      .catch(() => {});
  }, []);

  const loadAnalytics = useCallback(() => {
    getDashboardAnalytics({ app_ids: appIds || undefined })
      .then(setAnalytics)
      .catch(() => {});
  }, [appIds]);

  const loadDailyTrend = useCallback(() => {
    getDailyTrend({ app_ids: appIds || undefined, days: trendDays })
      .then((r) => setDailyTrend(r.trend_data ?? []))
      .catch(() => {});
  }, [appIds, trendDays]);

  const loadRevenueSummary = useCallback(() => {
    getRevenueSummary({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
    })
      .then(setRevenueSummary)
      .catch(() => {});
  }, [appIds, startDate, endDate]);

  const loadRevenueTrend = useCallback(() => {
    getRevenueTrend({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
      group_by: revenueGroupBy,
    })
      .then((r) => setRevenueTrend(r.list ?? []))
      .catch(() => {});
  }, [appIds, startDate, endDate, revenueGroupBy]);

  const loadRevenueByProduct = useCallback(() => {
    getRevenueByProduct({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
    })
      .then((r) => setRevenueByProduct(r.list ?? []))
      .catch(() => {});
  }, [appIds, startDate, endDate]);

  const loadChannelOverview = useCallback(() => {
    getChannelOverview({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
    })
      .then((r) => setChannelOverview(r.list ?? []))
      .catch(() => {});
  }, [appIds, startDate, endDate]);

  const loadCampaign = useCallback(() => {
    getCampaignAnalysis({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
    })
      .then((r) => setCampaignData(r.list ?? []))
      .catch(() => {});
  }, [appIds, startDate, endDate]);

  const loadCountryRevenue = useCallback(() => {
    getCountryRevenue({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
    })
      .then((r) => setCountryRevenue(r.list ?? []))
      .catch(() => {});
  }, [appIds, startDate, endDate]);

  const loadLtvByChannel = useCallback(() => {
    getLtvByChannel({
      app_ids: appIds || undefined,
      install_start_date: formatDate(ltvInstallRange[0]),
      install_end_date: formatDate(ltvInstallRange[1]),
    })
      .then((r) => setLtvByChannel(r.list ?? []))
      .catch(() => {});
  }, [appIds, ltvInstallRange]);

  const loadLtvCohort = useCallback(() => {
    getLtvCohort({
      app_ids: appIds || undefined,
      start_date: startDate,
      end_date: endDate,
      cohort_type: cohortType,
    })
      .then((r) => setLtvCohort(r.list ?? []))
      .catch(() => {});
  }, [appIds, startDate, endDate, cohortType]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);
  useEffect(() => {
    loadDailyTrend();
  }, [loadDailyTrend]);
  useEffect(() => {
    loadRevenueSummary();
  }, [loadRevenueSummary]);
  useEffect(() => {
    loadRevenueTrend();
  }, [loadRevenueTrend]);
  useEffect(() => {
    loadRevenueByProduct();
  }, [loadRevenueByProduct]);
  useEffect(() => {
    loadChannelOverview();
  }, [loadChannelOverview]);
  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);
  useEffect(() => {
    loadCountryRevenue();
  }, [loadCountryRevenue]);
  useEffect(() => {
    loadLtvByChannel();
  }, [loadLtvByChannel]);
  useEffect(() => {
    loadLtvCohort();
  }, [loadLtvCohort]);

  // Group daily trend by date for chart
  const trendDates = [...new Set(dailyTrend.map((d) => d.date))].sort();
  const trendAppIds = [...new Set(dailyTrend.map((d) => d.app_id))];
  const dailyTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: trendAppIds },
    xAxis: { type: 'category', data: trendDates },
    yAxis: { type: 'value' },
    series: trendAppIds.map((aid) => ({
      name: aid,
      type: 'line',
      data: trendDates.map((date) => {
        const item = dailyTrend.find(
          (d) => d.app_id === aid && d.date === date,
        );
        return item?.count ?? 0;
      }),
    })),
  };

  const revenueTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '净收入', '订阅数'] },
    xAxis: { type: 'category', data: revenueTrend.map((r) => r.period) },
    yAxis: [
      { type: 'value', name: '金额' },
      { type: 'value', name: '数量' },
    ],
    series: [
      { name: '收入', type: 'bar', data: revenueTrend.map((r) => r.revenue) },
      {
        name: '净收入',
        type: 'bar',
        data: revenueTrend.map((r) => r.net_revenue),
      },
      {
        name: '订阅数',
        type: 'line',
        yAxisIndex: 1,
        data: revenueTrend.map((r) => r.subscribe_count),
      },
    ],
  };

  return (
    <div>
      {/* Global filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              mode="multiple"
              placeholder="选择应用"
              style={{ minWidth: 200 }}
              value={selectedApps}
              onChange={setSelectedApps}
              options={appOptions.map((a) => ({
                label: a.app_name,
                value: a.app_id,
              }))}
              allowClear
            />
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={(v) => v && setDateRange(v as [Dayjs, Dayjs])}
            />
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订阅数"
              value={analytics?.today_subscription_count ?? '-'}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月订阅数"
              value={analytics?.month_subscription_count ?? '-'}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={analytics?.month_subscription_amount ?? '-'}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订阅收入"
              value={analytics?.total_subscription_amount ?? '-'}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Daily trend */}
      <Card
        title="每日订阅趋势"
        style={{ marginBottom: 16 }}
        extra={
          <Select
            value={trendDays}
            onChange={setTrendDays}
            style={{ width: 100 }}
          >
            {[7, 14, 30, 90, 180, 365].map((d) => (
              <Select.Option key={d} value={d}>
                {d} 天
              </Select.Option>
            ))}
          </Select>
        }
      >
        <ChartCard title="" option={dailyTrendOption} height={280} />
      </Card>

      {/* Revenue Summary */}
      {revenueSummary && (
        <Card title="收入概览" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {[
              ['总收入', revenueSummary.total_revenue, '¥'],
              ['净收入', revenueSummary.net_revenue, '¥'],
              ['退款金额', revenueSummary.refund_amount, '¥'],
              ['订阅数', revenueSummary.subscribe_count, ''],
              ['续订数', revenueSummary.renew_count, ''],
              ['退款数', revenueSummary.refund_count, ''],
              [
                '退款率',
                (revenueSummary.refund_rate * 100).toFixed(1) + '%',
                '',
              ],
              [
                '续订率',
                (revenueSummary.renew_rate * 100).toFixed(1) + '%',
                '',
              ],
              ['ARPU', revenueSummary.ARPU, '¥'],
            ].map(([title, value, prefix]) => (
              <Col key={title as string} span={8} style={{ marginBottom: 12 }}>
                <Statistic
                  title={title as string}
                  value={typeof value === 'number' ? value : (value as string)}
                  prefix={prefix as string}
                  precision={
                    typeof value === 'number' && prefix === '¥' ? 2 : 0
                  }
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Revenue Trend */}
      <Card
        title="收入趋势"
        style={{ marginBottom: 16 }}
        extra={
          <Tabs
            activeKey={revenueGroupBy}
            onChange={(k) => setRevenueGroupBy(k as 'day' | 'week' | 'month')}
            items={[
              { key: 'day', label: '日' },
              { key: 'week', label: '周' },
              { key: 'month', label: '月' },
            ]}
            size="small"
          />
        }
      >
        <ChartCard title="" option={revenueTrendOption} height={280} />
      </Card>

      {/* Revenue by Product */}
      <Card title="产品维度收入" style={{ marginBottom: 16 }}>
        <Table
          rowKey="product_id"
          dataSource={revenueByProduct}
          pagination={false}
          size="small"
          columns={[
            { title: '产品ID', dataIndex: 'product_id' },
            {
              title: '订阅数',
              dataIndex: 'subscribe_count',
              sorter: (a, b) => a.subscribe_count - b.subscribe_count,
            },
            {
              title: '收入',
              dataIndex: 'revenue',
              sorter: (a, b) => a.revenue - b.revenue,
            },
            {
              title: '占比',
              dataIndex: 'percentage',
              render: (v) => `${(v * 100).toFixed(1)}%`,
            },
          ]}
        />
      </Card>

      {/* Channel Overview */}
      <Card title="渠道效果总览" style={{ marginBottom: 16 }}>
        <Table
          rowKey="tracker_network"
          dataSource={channelOverview}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          columns={[
            { title: '渠道', dataIndex: 'tracker_network' },
            {
              title: '安装数',
              dataIndex: 'install_count',
              sorter: (a, b) => a.install_count - b.install_count,
            },
            {
              title: '试用数',
              dataIndex: 'trial_count',
              sorter: (a, b) => a.trial_count - b.trial_count,
            },
            {
              title: '订阅数',
              dataIndex: 'subscribe_count',
              sorter: (a, b) => a.subscribe_count - b.subscribe_count,
            },
            {
              title: '续订数',
              dataIndex: 'renew_count',
              sorter: (a, b) => a.renew_count - b.renew_count,
            },
            {
              title: '退款数',
              dataIndex: 'refund_count',
              sorter: (a, b) => a.refund_count - b.refund_count,
            },
            {
              title: '收入',
              dataIndex: 'revenue',
              sorter: (a, b) => a.revenue - b.revenue,
            },
            {
              title: '净收入',
              dataIndex: 'net_revenue',
              sorter: (a, b) => a.net_revenue - b.net_revenue,
            },
            {
              title: '安装→试用率',
              dataIndex: 'install_to_trial_rate',
              render: (v) => `${(v * 100).toFixed(1)}%`,
            },
            {
              title: '试用→付费率',
              dataIndex: 'trial_to_paid_rate',
              render: (v) => `${(v * 100).toFixed(1)}%`,
            },
          ]}
        />
      </Card>

      {/* Campaign Analysis */}
      <Card title="Campaign 分析" style={{ marginBottom: 16 }}>
        <Table
          rowKey="campaign_id"
          dataSource={campaignData}
          pagination={false}
          size="small"
          columns={[
            { title: 'Campaign ID', dataIndex: 'campaign_id' },
            { title: '渠道', dataIndex: 'tracker_network' },
            {
              title: '安装数',
              dataIndex: 'install_count',
              sorter: (a, b) => a.install_count - b.install_count,
            },
            {
              title: '订阅数',
              dataIndex: 'subscribe_count',
              sorter: (a, b) => a.subscribe_count - b.subscribe_count,
            },
            {
              title: '收入',
              dataIndex: 'revenue',
              sorter: (a, b) => a.revenue - b.revenue,
            },
            {
              title: '净收入',
              dataIndex: 'net_revenue',
              sorter: (a, b) => a.net_revenue - b.net_revenue,
            },
          ]}
        />
      </Card>

      {/* Country Revenue */}
      <Card title="国家收入分布" style={{ marginBottom: 16 }}>
        <Table
          rowKey="country"
          dataSource={countryRevenue}
          pagination={false}
          size="small"
          columns={[
            { title: '国家', dataIndex: 'country' },
            {
              title: '安装数',
              dataIndex: 'install_count',
              sorter: (a, b) => a.install_count - b.install_count,
            },
            {
              title: '订阅数',
              dataIndex: 'subscribe_count',
              sorter: (a, b) => a.subscribe_count - b.subscribe_count,
            },
            {
              title: '收入',
              dataIndex: 'revenue',
              sorter: (a, b) => a.revenue - b.revenue,
            },
            {
              title: '净收入',
              dataIndex: 'net_revenue',
              sorter: (a, b) => a.net_revenue - b.net_revenue,
            },
          ]}
        />
      </Card>

      {/* LTV by Channel */}
      <Card
        title="LTV 分析（按渠道）"
        style={{ marginBottom: 16 }}
        extra={
          <RangePicker
            value={ltvInstallRange}
            onChange={(v) => v && setLtvInstallRange(v as [Dayjs, Dayjs])}
          />
        }
      >
        <Table
          rowKey="tracker_network"
          dataSource={ltvByChannel}
          pagination={false}
          size="small"
          columns={[
            { title: '渠道', dataIndex: 'tracker_network' },
            { title: '安装数', dataIndex: 'install_count' },
            { title: '付费用户', dataIndex: 'paid_user_count' },
            { title: '总收入', dataIndex: 'total_revenue' },
            { title: 'LTV', dataIndex: 'ltv' },
            {
              title: '付费率',
              dataIndex: 'paid_rate',
              render: (v) => `${(v * 100).toFixed(1)}%`,
            },
          ]}
        />
      </Card>

      {/* LTV Cohort */}
      <Card
        title="LTV Cohort"
        style={{ marginBottom: 16 }}
        extra={
          <Tabs
            activeKey={cohortType}
            onChange={(k) => setCohortType(k as 'day' | 'week' | 'month')}
            items={[
              { key: 'day', label: '日' },
              { key: 'week', label: '周' },
              { key: 'month', label: '月' },
            ]}
            size="small"
          />
        }
      >
        <Table
          rowKey="cohort_date"
          dataSource={ltvCohort}
          pagination={false}
          size="small"
          columns={[
            { title: 'Cohort', dataIndex: 'cohort_date' },
            { title: '安装数', dataIndex: 'install_count' },
            { title: 'D7 LTV', dataIndex: 'd7_ltv' },
            { title: 'D30 LTV', dataIndex: 'd30_ltv' },
            { title: 'D60 LTV', dataIndex: 'd60_ltv' },
            { title: 'D90 LTV', dataIndex: 'd90_ltv' },
          ]}
        />
      </Card>
    </div>
  );
}
