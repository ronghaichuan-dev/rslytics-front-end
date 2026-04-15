import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import KpiCard from '@/components/KpiCard';
import {
  getChannelKpi,
  getChannelList,
  getChannelTrend,
  getCountryOptions,
  exportChannelListUrl,
  type ChannelKpiData,
  type ChannelListItem,
  type ChannelTrendSeries,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Row, Select, Space, Spin, Table, Typography, Button, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const metricOptions = [
  { label: '安装量', value: 'install_count' },
  { label: '试用量', value: 'trial_count' },
  { label: '净收入', value: 'net_revenue' },
];

const columnOptions = [
  { label: '安装量', value: 'install_count' },
  { label: '试用量', value: 'trial_count' },
  { label: '付费订阅', value: 'subscribe_count' },
  { label: '净收入', value: 'net_revenue' },
];

const AnalyticsChannel: React.FC = () => {
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
  const [kpiData, setKpiData] = useState<ChannelKpiData | null>(null);
  const [trendSeries, setTrendSeries] = useState<ChannelTrendSeries[]>([]);
  const [listData, setListData] = useState<ChannelListItem[]>([]);
  const [totalRow, setTotalRow] = useState<ChannelListItem | null>(null);
  const [sortField, setSortField] = useState('net_revenue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'install_count', 'trial_count', 'subscribe_count', 'net_revenue',
  ]);

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
        compare_start_date: compareRange?.startDate,
        compare_end_date: compareRange?.endDate,
        countries: countriesParam,
        timezone,
      };

      const [kpi, trend, list] = await Promise.all([
        getChannelKpi(baseParams),
        getChannelTrend({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          countries: countriesParam,
          metric,
        }),
        getChannelList({
          ...baseParams,
          level: 'network',
          sort_field: sortField,
          sort_order: sortOrder,
        }),
      ]);

      setKpiData(kpi);
      setTrendSeries(trend?.series || []);
      setListData(list?.list || []);
      setTotalRow(list?.total || null);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedApps, dateRange, compareRange, metric, sortField, sortOrder, selectedCountries, timezone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExpand = useCallback(
    async (expanded: boolean, record: ChannelListItem) => {
      if (!expanded || !record.has_children) return;
      const countriesParam = selectedCountries.length > 0 ? selectedCountries.join(',') : undefined;
      const children = await getChannelList({
        app_ids: selectedApps.join(',') || undefined,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        compare_start_date: compareRange?.startDate,
        compare_end_date: compareRange?.endDate,
        countries: countriesParam,
        level: 'campaign',
        parent_id: record.id,
        sort_field: sortField,
        sort_order: sortOrder,
      });
      setListData((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? { ...item, children: children?.list }
            : item,
        ),
      );
    },
    [selectedApps, dateRange, compareRange, sortField, sortOrder, selectedCountries],
  );

  const hasCompare = !!compareRange;

  const buildCompareColumns = (
    title: string,
    field: 'install_count' | 'trial_count' | 'subscribe_count' | 'net_revenue',
    isRevenue = false,
  ): ColumnsType<ChannelListItem> => {
    const cols: ColumnsType<ChannelListItem> = [
      {
        title: hasCompare ? `${title}(当期)` : title,
        dataIndex: [field, 'current'],
        sorter: true,
        render: (val: number) =>
          isRevenue ? `$${val?.toFixed(2) ?? '0.00'}` : (val ?? 0),
      },
    ];
    if (hasCompare) {
      cols.push(
        {
          title: `${title}(对比)`,
          dataIndex: [field, 'compare'],
          render: (val: number) =>
            isRevenue ? `$${val?.toFixed(2) ?? '0.00'}` : (val ?? 0),
        },
        {
          title: '变化',
          dataIndex: [field, 'change_rate'],
          render: (val: number) => {
            if (val === undefined || val === null) return '-';
            const color = val > 0 ? '#52c41a' : val < 0 ? '#f5222d' : '#666';
            return (
              <span style={{ color }}>
                {val > 0 ? '+' : ''}
                {val.toFixed(1)}%
              </span>
            );
          },
        },
      );
    }
    return cols;
  };

  const columns: ColumnsType<ChannelListItem> = [
    { title: '渠道', dataIndex: 'name', fixed: 'left' as const, width: 200 },
    ...(visibleColumns.includes('install_count') ? buildCompareColumns('安装量', 'install_count') : []),
    ...(visibleColumns.includes('trial_count') ? buildCompareColumns('试用量', 'trial_count') : []),
    ...(visibleColumns.includes('subscribe_count') ? buildCompareColumns('付费订阅', 'subscribe_count') : []),
    ...(visibleColumns.includes('net_revenue') ? buildCompareColumns('净收入', 'net_revenue', true) : []),
  ];

  const trendOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: trendSeries.map((s) => s.tracker_network || '未知') },
    xAxis: {
      type: 'category' as const,
      data: trendSeries[0]?.points?.map((p) => p.date) || [],
    },
    yAxis: { type: 'value' as const },
    series: trendSeries.map((s) => ({
      name: s.tracker_network || '未知',
      type: 'line',
      data: s.points?.map((p) => p.value) || [],
      smooth: true,
    })),
  };

  const handleExport = useCallback(() => {
    const params: Record<string, string> = {
      app_ids: selectedApps.join(',') || '',
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      sort_field: sortField,
      sort_order: sortOrder,
      columns: visibleColumns.join(','),
    };
    if (compareRange?.startDate) params.compare_start_date = compareRange.startDate;
    if (compareRange?.endDate) params.compare_end_date = compareRange.endDate;
    if (selectedCountries.length > 0) params.countries = selectedCountries.join(',');
    window.open(exportChannelListUrl(params), '_blank');
  }, [selectedApps, dateRange, compareRange, sortField, sortOrder, visibleColumns, selectedCountries]);

  return (
    <PageContainer header={{ title: '渠道分析' }}>
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
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={5}>
            <KpiCard
              title="总安装"
              current={kpiData?.install_count?.current ?? 0}
              compare={kpiData?.install_count?.compare}
              changeRate={kpiData?.install_count?.change_rate}
            />
          </Col>
          <Col span={5}>
            <KpiCard
              title="总试用"
              current={kpiData?.trial_count?.current ?? 0}
              compare={kpiData?.trial_count?.compare}
              changeRate={kpiData?.trial_count?.change_rate}
            />
          </Col>
          <Col span={5}>
            <KpiCard
              title="总付费"
              current={kpiData?.subscribe_count?.current ?? 0}
              compare={kpiData?.subscribe_count?.compare}
              changeRate={kpiData?.subscribe_count?.change_rate}
            />
          </Col>
          <Col span={5}>
            <KpiCard
              title="净收入"
              current={kpiData?.net_revenue?.current ?? 0}
              compare={kpiData?.net_revenue?.compare}
              changeRate={kpiData?.net_revenue?.change_rate}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={4}>
            <KpiCard
              title="安装→付费率"
              current={kpiData?.install_to_paid_rate?.current ?? 0}
              compare={kpiData?.install_to_paid_rate?.compare}
              changeRate={kpiData?.install_to_paid_rate?.change_rate}
              suffix="%"
              precision={1}
            />
          </Col>
        </Row>

        <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <Space style={{ marginBottom: 8 }}>
            <Text strong>渠道趋势</Text>
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

        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>渠道明细</Text>
            <Space>
              <Checkbox.Group
                options={columnOptions}
                value={visibleColumns}
                onChange={(vals) => setVisibleColumns(vals as string[])}
              />
              <Button onClick={handleExport}>
                导出 CSV
              </Button>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={listData}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={false}
            expandable={{
              onExpand: handleExpand,
              rowExpandable: (record) => record.has_children,
            }}
            onChange={(_pagination, _filters, sorter: any) => {
              if (sorter?.field) {
                const field = Array.isArray(sorter.field) ? sorter.field[0] : sorter.field;
                setSortField(field);
                setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
              }
            }}
            summary={() =>
              totalRow ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>{totalRow.name}</strong>
                    </Table.Summary.Cell>
                    {visibleColumns.map((col, idx) => {
                      const data = totalRow[col as keyof ChannelListItem] as any;
                      const isRevenue = col === 'net_revenue';
                      const cells = [];
                      cells.push(
                        <Table.Summary.Cell key={`${col}-cur`} index={idx * (hasCompare ? 3 : 1) + 1}>
                          <strong>{isRevenue ? `$${data?.current?.toFixed(2) ?? '0.00'}` : (data?.current ?? 0)}</strong>
                        </Table.Summary.Cell>
                      );
                      if (hasCompare) {
                        cells.push(
                          <Table.Summary.Cell key={`${col}-cmp`} index={idx * 3 + 2}>
                            {isRevenue ? `$${data?.compare?.toFixed(2) ?? '0.00'}` : (data?.compare ?? 0)}
                          </Table.Summary.Cell>,
                          <Table.Summary.Cell key={`${col}-chg`} index={idx * 3 + 3}>
                            {data?.change_rate != null ? (
                              <span style={{ color: data.change_rate > 0 ? '#52c41a' : data.change_rate < 0 ? '#f5222d' : '#666' }}>
                                {data.change_rate > 0 ? '+' : ''}{data.change_rate.toFixed(1)}%
                              </span>
                            ) : '-'}
                          </Table.Summary.Cell>
                        );
                      }
                      return cells;
                    })}
                  </Table.Summary.Row>
                </Table.Summary>
              ) : undefined
            }
          />
        </div>
      </Spin>
    </PageContainer>
  );
};

export default AnalyticsChannel;
