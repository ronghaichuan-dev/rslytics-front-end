import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import KpiCard from '@/components/KpiCard';
import {
  getCohortLtvCurve,
  getCohortHeatmap,
  getCohortKpi,
  getCountryOptions,
  exportCohortHeatmapUrl,
  type CohortKpiData,
  type LtvCurveLine,
  type HeatmapData,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Col, Row, Select, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const granularityOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
];

const metricOptions = [
  { label: 'LTV', value: 'ltv' },
  { label: '付费率', value: 'paid_rate' },
  { label: '试用→付费率', value: 'trial_to_paid_rate' },
];

const groupByOptions = [
  { label: '渠道', value: 'tracker_network' },
  { label: '国家', value: 'country' },
];

const AnalyticsCohort: React.FC = () => {
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
  const [granularity, setGranularity] = useState('day');
  const [curveMetric, setCurveMetric] = useState('ltv');
  const [heatmapMetric, setHeatmapMetric] = useState('ltv');
  const [groupBy, setGroupBy] = useState('tracker_network');
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<CohortKpiData | null>(null);
  const [curveLines, setCurveLines] = useState<LtvCurveLine[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);

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
      const baseParams = {
        app_ids: selectedApps.join(',') || undefined,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        countries: countriesParam,
        granularity,
        timezone,
      };

      const [kpi, curve, heatmap] = await Promise.all([
        getCohortKpi({
          ...baseParams,
          compare_start_date: compareRange?.startDate,
          compare_end_date: compareRange?.endDate,
        }),
        getCohortLtvCurve({
          ...baseParams,
          group_by: groupBy,
          metric: curveMetric,
        }),
        getCohortHeatmap({
          ...baseParams,
          metric: heatmapMetric,
        }),
      ]);

      setKpiData(kpi);
      setCurveLines(curve?.lines || []);
      setHeatmapData(heatmap);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedApps, dateRange, compareRange, selectedCountries, granularity, curveMetric, heatmapMetric, groupBy, timezone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // LTV Curve chart option
  const curveOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: curveLines.map((l) => l.name) },
    xAxis: {
      type: 'category' as const,
      name: '天数',
      data: curveLines[0]?.data_points?.map((p) => `D${p.day}`) || [],
    },
    yAxis: {
      type: 'value' as const,
      name: curveMetric === 'ltv' ? 'LTV' : '%',
    },
    series: curveLines.map((l) => ({
      name: l.name,
      type: 'line',
      data: l.data_points?.map((p) => p.value) || [],
      smooth: true,
    })),
  };

  // Heatmap table columns
  const heatmapColumns: ColumnsType<any> = [
    {
      title: '群组日期',
      dataIndex: 'cohort_date',
      fixed: 'left' as const,
      width: 120,
    },
    {
      title: '安装量',
      dataIndex: 'install_count',
      width: 80,
    },
    ...(heatmapData?.days || []).map((d, idx) => ({
      title: `D${d}`,
      dataIndex: ['values', idx],
      width: 80,
      render: (val: number | null) => {
        if (val === null || val === undefined) return <span style={{ color: '#ccc' }}>-</span>;
        return val.toFixed(2);
      },
      onCell: (record: any) => {
        const v = record.values?.[idx];
        if (v === null || v === undefined) return {};
        // Color intensity based on value
        const maxVal = heatmapMetric === 'ltv' ? 10 : 100;
        const intensity = Math.min(v / maxVal, 1);
        const bg = `rgba(24, 144, 255, ${intensity * 0.5})`;
        return { style: { background: bg } };
      },
    })),
  ];

  const handleExportHeatmap = useCallback(() => {
    const params: Record<string, string> = {
      app_ids: selectedApps.join(',') || '',
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      granularity,
      metric: heatmapMetric,
    };
    if (selectedCountries.length > 0) params.countries = selectedCountries.join(',');
    window.open(exportCohortHeatmapUrl(params), '_blank');
  }, [selectedApps, dateRange, granularity, heatmapMetric, selectedCountries]);

  return (
    <PageContainer header={{ title: 'Cohort & LTV 分析' }}>
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
          style={{ width: 80 }}
          value={granularity}
          onChange={setGranularity}
          options={granularityOptions}
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
        {/* KPI Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={5}>
            <KpiCard
              title="平均 D7 LTV"
              current={kpiData?.avg_d7_ltv?.current ?? 0}
              compare={kpiData?.avg_d7_ltv?.compare}
              changeRate={kpiData?.avg_d7_ltv?.change_rate}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={5}>
            <KpiCard
              title="平均 D30 LTV"
              current={kpiData?.avg_d30_ltv?.current ?? 0}
              compare={kpiData?.avg_d30_ltv?.compare}
              changeRate={kpiData?.avg_d30_ltv?.change_rate}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={5}>
            <KpiCard
              title="平均 D90 LTV"
              current={kpiData?.avg_d90_ltv?.current ?? 0}
              compare={kpiData?.avg_d90_ltv?.compare}
              changeRate={kpiData?.avg_d90_ltv?.change_rate}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={5}>
            <KpiCard
              title="总安装"
              current={kpiData?.total_install?.current ?? 0}
              compare={kpiData?.total_install?.compare}
              changeRate={kpiData?.total_install?.change_rate}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="总收入"
              current={kpiData?.total_revenue?.current ?? 0}
              compare={kpiData?.total_revenue?.compare}
              changeRate={kpiData?.total_revenue?.change_rate}
              prefix="$"
              precision={2}
            />
          </Col>
        </Row>

        {/* LTV Curve Chart */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <Space style={{ marginBottom: 8 }}>
            <Text strong>LTV 曲线</Text>
            <Select
              size="small"
              value={curveMetric}
              onChange={setCurveMetric}
              options={metricOptions.filter((o) => o.value !== 'trial_to_paid_rate')}
              style={{ width: 100 }}
            />
            <Select
              size="small"
              value={groupBy}
              onChange={setGroupBy}
              options={groupByOptions}
              style={{ width: 80 }}
            />
          </Space>
          <ReactECharts option={curveOption} style={{ height: 350 }} />
        </div>

        {/* Heatmap Table */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <Text strong>群组热力表</Text>
              <Select
                size="small"
                value={heatmapMetric}
                onChange={setHeatmapMetric}
                options={metricOptions}
                style={{ width: 120 }}
              />
            </Space>
            <Button onClick={handleExportHeatmap}>
              导出 CSV
            </Button>
          </div>
          <Table
            columns={heatmapColumns}
            dataSource={heatmapData?.rows || []}
            rowKey="cohort_date"
            scroll={{ x: 800 + (heatmapData?.days?.length || 0) * 80 }}
            pagination={false}
            size="small"
          />
        </div>
      </Spin>
    </PageContainer>
  );
};

export default AnalyticsCohort;
