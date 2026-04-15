import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import KpiCard from '@/components/KpiCard';
import {
  getFunnelOverview,
  getFunnelReasons,
  getFunnelStatus,
  getFunnelBreakdown,
  getCountryOptions,
  type FunnelOverviewData,
  type FunnelReasonItem,
  type FunnelStatusData,
  type FunnelBreakdownItem,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Row, Select, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const dimOptions = [
  { label: '渠道', value: 'tracker_network' },
  { label: '国家', value: 'country' },
  { label: '应用版本', value: 'app_version' },
  { label: '活动', value: 'campaign_id' },
];

const AnalyticsFunnel: React.FC = () => {
  const [appList, setAppList] = useState<{ app_id: string; app_name: string }[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  });
  const [compareRange, setCompareRange] = useState<DateRange | undefined>();
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [dimension, setDimension] = useState('tracker_network');
  const [loading, setLoading] = useState(false);
  const [funnelData, setFunnelData] = useState<FunnelOverviewData | null>(null);
  const [reasonData, setReasonData] = useState<FunnelReasonItem[]>([]);
  const [statusData, setStatusData] = useState<FunnelStatusData | null>(null);
  const [breakdownData, setBreakdownData] = useState<FunnelBreakdownItem[]>([]);
  const [sortField, setSortField] = useState('subscribe_count');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    getAppSelectList().then((res) => {
      setAppList(res?.list || []);
    });
  }, []);

  useEffect(() => {
    getCountryOptions({ app_ids: selectedApps.join(',') || undefined }).then((res) => {
      setCountryOptions(res?.list || []);
    }).catch(() => {});
  }, [selectedApps]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const countriesParam = selectedCountries.length > 0 ? selectedCountries.join(',') : undefined;
      const [funnel, reasons, status, breakdown] = await Promise.all([
        getFunnelOverview({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          compare_start_date: compareRange?.startDate,
          compare_end_date: compareRange?.endDate,
          countries: countriesParam,
          timezone,
        }),
        getFunnelReasons({ app_ids: selectedApps.join(',') || undefined }),
        getFunnelStatus({ app_ids: selectedApps.join(',') || undefined }),
        getFunnelBreakdown({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          countries: countriesParam,
          dimension,
          sort_field: sortField,
          sort_order: sortOrder,
        }),
      ]);
      setFunnelData(funnel);
      setReasonData(reasons?.list || []);
      setStatusData(status);
      setBreakdownData(breakdown?.list || []);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedApps, dateRange, compareRange, selectedCountries, dimension, sortField, sortOrder, timezone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funnel chart
  const funnelOption = {
    tooltip: { trigger: 'item' as const },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        sort: 'descending' as const,
        gap: 2,
        data: [
          { name: '安装', value: funnelData?.install_count?.current ?? 0 },
          { name: '试用', value: funnelData?.trial_count?.current ?? 0 },
          { name: '付费', value: funnelData?.subscribe_count?.current ?? 0 },
          { name: '续费', value: funnelData?.renew_count?.current ?? 0 },
        ],
      },
    ],
  };

  // Reasons pie
  const reasonPieOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: reasonData.map((r) => ({ name: r.reason_name || `原因${r.reason}`, value: r.count })),
      },
    ],
  };

  // Status pie
  const statusPieOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: (statusData?.list || []).map((s) => ({
          name: s.status_name || `状态${s.status}`,
          value: s.count,
        })),
      },
    ],
  };

  const breakdownColumns: ColumnsType<FunnelBreakdownItem> = [
    { title: '维度', dataIndex: 'name', fixed: 'left', width: 160 },
    { title: '安装', dataIndex: 'install_count', sorter: true },
    { title: '试用', dataIndex: 'trial_count', sorter: true },
    { title: '付费', dataIndex: 'subscribe_count', sorter: true },
    { title: '续费', dataIndex: 'renew_count', sorter: true },
    { title: '退款', dataIndex: 'refund_count', sorter: true },
    {
      title: '安装→试用',
      dataIndex: 'install_to_trial_rate',
      render: (v: number) => `${(v ?? 0).toFixed(1)}%`,
    },
    {
      title: '试用→付费',
      dataIndex: 'trial_to_paid_rate',
      render: (v: number) => `${(v ?? 0).toFixed(1)}%`,
    },
    {
      title: '续费率',
      dataIndex: 'renew_rate',
      render: (v: number) => `${(v ?? 0).toFixed(1)}%`,
    },
    {
      title: '退款率',
      dataIndex: 'refund_rate',
      render: (v: number) => `${(v ?? 0).toFixed(1)}%`,
    },
    {
      title: '安装→付费',
      dataIndex: 'install_to_paid_rate',
      render: (v: number) => `${(v ?? 0).toFixed(1)}%`,
    },
  ];

  return (
    <PageContainer header={{ title: '订阅漏斗' }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          size="large"
          mode="multiple"
          style={{ width: 320 }}
          value={selectedApps}
          onChange={setSelectedApps}
          placeholder="全部应用"
          allowClear
          maxTagCount={3}
          options={appList.map((a) => ({ label: a.app_name, value: a.app_id }))}
        />
        <CompareDatePicker
          size="large"
          value={dateRange}
          compareValue={compareRange}
          onChange={setDateRange}
          onCompareChange={setCompareRange}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
        <Select
          size="large"
          mode="multiple"
          style={{ minWidth: 200 }}
          value={selectedCountries}
          onChange={setSelectedCountries}
          placeholder="全部国家"
          allowClear
          maxTagCount={3}
          options={countryOptions.map((c) => ({ label: c, value: c }))}
        />
      </Space>

      <Spin spinning={loading}>
        {/* KPI Cards - 转化率 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <KpiCard
              title="安装→试用"
              current={funnelData?.install_to_trial_rate?.current ?? 0}
              compare={funnelData?.install_to_trial_rate?.compare}
              changeRate={funnelData?.install_to_trial_rate?.change_rate}
              suffix="%"
              precision={1}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="试用→付费"
              current={funnelData?.trial_to_paid_rate?.current ?? 0}
              compare={funnelData?.trial_to_paid_rate?.compare}
              changeRate={funnelData?.trial_to_paid_rate?.change_rate}
              suffix="%"
              precision={1}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="付费→续费"
              current={funnelData?.paid_to_renew_rate?.current ?? 0}
              compare={funnelData?.paid_to_renew_rate?.compare}
              changeRate={funnelData?.paid_to_renew_rate?.change_rate}
              suffix="%"
              precision={1}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="安装→付费"
              current={funnelData?.install_to_paid_rate?.current ?? 0}
              compare={funnelData?.install_to_paid_rate?.compare}
              changeRate={funnelData?.install_to_paid_rate?.change_rate}
              suffix="%"
              precision={1}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="净留存"
              current={funnelData?.net_retention?.current ?? 0}
              compare={funnelData?.net_retention?.compare}
              changeRate={funnelData?.net_retention?.change_rate}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="自动续费率"
              current={statusData?.auto_renew_rate ?? 0}
              suffix="%"
              precision={1}
            />
          </Col>
        </Row>

        {/* Funnel + Pie Charts */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
              <Text strong>漏斗图</Text>
              <ReactECharts option={funnelOption} style={{ height: 300 }} />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
              <Text strong>过期原因分布</Text>
              <ReactECharts option={reasonPieOption} style={{ height: 300 }} />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
              <Text strong>订阅状态分布</Text>
              <ReactECharts option={statusPieOption} style={{ height: 300 }} />
            </div>
          </Col>
        </Row>

        {/* Breakdown Table */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <Space style={{ marginBottom: 16 }}>
            <Text strong>漏斗分维度明细</Text>
            <Select
              size="small"
              value={dimension}
              onChange={setDimension}
              options={dimOptions}
              style={{ width: 100 }}
            />
          </Space>
          <Table
            columns={breakdownColumns}
            dataSource={breakdownData}
            rowKey="name"
            scroll={{ x: 1400 }}
            pagination={false}
            onChange={(_p, _f, sorter: any) => {
              if (sorter?.field) {
                setSortField(sorter.field as string);
                setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
              }
            }}
          />
        </div>
      </Spin>
    </PageContainer>
  );
};

export default AnalyticsFunnel;
