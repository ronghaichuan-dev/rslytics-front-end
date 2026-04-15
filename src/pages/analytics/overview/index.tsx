import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import KpiCard from '@/components/KpiCard';
import {
  getOverviewChannelShare,
  getOverviewKpi,
  getOverviewTrend,
  getCountryOptions,
  type OverviewKpiData,
  type OverviewTrendData,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Row, Select, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const metricOptions = [
  { label: '安装量', value: 'install_count' },
  { label: '试用量', value: 'trial_count' },
  { label: '付费量', value: 'subscribe_count' },
  { label: '净收入', value: 'net_revenue' },
];

const AnalyticsOverview: React.FC = () => {
  const [appList, setAppList] = useState<{ app_id: string; app_name: string }[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  });
  const [compareRange, setCompareRange] = useState<DateRange | undefined>();
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [metric, setMetric] = useState('install_count');
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [kpiData, setKpiData] = useState<OverviewKpiData | null>(null);
  const [trendData, setTrendData] = useState<OverviewTrendData | null>(null);
  const [channelShareData, setChannelShareData] = useState<
    { tracker_network: string; install_count: number; percentage: number }[]
  >([]);

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
      const params = {
        app_ids: selectedApps.join(',') || undefined,
        timezone,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        compare_start_date: compareRange?.startDate,
        compare_end_date: compareRange?.endDate,
        countries: countriesParam,
      };

      const [kpi, trend, share] = await Promise.all([
        getOverviewKpi(params),
        getOverviewTrend({ ...params, metric }),
        getOverviewChannelShare({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          countries: countriesParam,
        }),
      ]);

      setKpiData(kpi);
      setTrendData(trend);
      setChannelShareData(share?.list || []);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedApps, dateRange, compareRange, metric, selectedCountries, timezone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const trendOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: trendData?.current?.map((p) => p.date) || [],
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        name: '当期',
        type: 'line',
        data: trendData?.current?.map((p) => p.value) || [],
        smooth: true,
      },
      ...(trendData?.compare
        ? [
            {
              name: '对比',
              type: 'line' as const,
              data: trendData.compare.map((p) => p.value),
              smooth: true,
              lineStyle: { type: 'dashed' as const, color: '#fa8c16' },
              itemStyle: { color: '#fa8c16' },
            },
          ]
        : []),
    ],
  };

  const pieOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: channelShareData.map((item) => ({
          name: item.tracker_network || '未知',
          value: item.install_count,
        })),
      },
    ],
  };

  return (
    <PageContainer
      header={{
        title: '数据概览',
        subTitle: kpiData?.data_updated_at
          ? `数据更新至: ${kpiData.data_updated_at}`
          : undefined,
      }}
    >
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
          options={appList.map((a) => ({
            label: a.app_name,
            value: a.app_id,
          }))}
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
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <KpiCard
              title="安装量"
              current={kpiData?.install_count?.current ?? 0}
              compare={kpiData?.install_count?.compare}
              changeRate={kpiData?.install_count?.change_rate}
            />
          </Col>
          <Col span={6}>
            <KpiCard
              title="试用量"
              current={kpiData?.trial_count?.current ?? 0}
              compare={kpiData?.trial_count?.compare}
              changeRate={kpiData?.trial_count?.change_rate}
            />
          </Col>
          <Col span={6}>
            <KpiCard
              title="付费订阅量"
              current={kpiData?.subscribe_count?.current ?? 0}
              compare={kpiData?.subscribe_count?.compare}
              changeRate={kpiData?.subscribe_count?.change_rate}
            />
          </Col>
          <Col span={6}>
            <KpiCard
              title="净收入"
              current={kpiData?.net_revenue?.current ?? 0}
              compare={kpiData?.net_revenue?.compare}
              changeRate={kpiData?.net_revenue?.change_rate}
              prefix="$"
              precision={2}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Space style={{ marginBottom: 8 }}>
                <Text strong>趋势图</Text>
                <Select
                  size="small"
                  value={metric}
                  onChange={setMetric}
                  options={metricOptions}
                  style={{ width: 100 }}
                />
              </Space>
              <ReactECharts option={trendOption} style={{ height: 350 }} />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Text strong>渠道安装占比</Text>
              <ReactECharts option={pieOption} style={{ height: 350 }} />
            </div>
          </Col>
        </Row>
      </Spin>
    </PageContainer>
  );
};

export default AnalyticsOverview;
