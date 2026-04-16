import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import {
  getChannelOptions,
  getGeoList,
  getGeoMap,
  getGeoTop,
  type GeoListItem,
  type GeoMapItem,
  type GeoTopItem,
  type RsNetworkItem,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Row, Select, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const metricOptions = [
  { label: '安装量', value: 'install_count' },
  { label: '净收入', value: 'net_revenue' },
];

const AnalyticsGeo: React.FC = () => {
  const [appList, setAppList] = useState<
    { app_id: string; app_name: string }[]
  >([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  });
  const [compareRange, setCompareRange] = useState<DateRange | undefined>();
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [channelOptions, setChannelOptions] = useState<RsNetworkItem[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [metric, setMetric] = useState('install_count');
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<GeoMapItem[]>([]);
  const [topData, setTopData] = useState<GeoTopItem[]>([]);
  const [listData, setListData] = useState<GeoListItem[]>([]);
  const [totalRow, setTotalRow] = useState<GeoListItem | null>(null);
  const [sortField, setSortField] = useState('net_revenue');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    getAppSelectList().then((res) => {
      setAppList(res?.list || []);
    });
    getChannelOptions().then((res) => {
      setChannelOptions(res?.list || []);
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mapRes, topRes, listRes] = await Promise.all([
        getGeoMap({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          tracker_network: selectedChannel || undefined,
          metric,
          timezone,
        }),
        getGeoTop({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          compare_start_date: compareRange?.startDate,
          compare_end_date: compareRange?.endDate,
          tracker_network: selectedChannel || undefined,
          metric,
          limit: 5,
          timezone,
        }),
        getGeoList({
          app_ids: selectedApps.join(',') || undefined,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          compare_start_date: compareRange?.startDate,
          compare_end_date: compareRange?.endDate,
          tracker_network: selectedChannel || undefined,
          sort_field: sortField,
          sort_order: sortOrder,
          timezone,
        }),
      ]);
      setMapData(mapRes?.list || []);
      setTopData(topRes?.list || []);
      setListData(listRes?.list || []);
      setTotalRow(listRes?.total || null);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [
    selectedApps,
    dateRange,
    compareRange,
    selectedChannel,
    metric,
    sortField,
    sortOrder,
    timezone,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasCompare = !!compareRange;

  // World map option
  const mapOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => {
        const name = params.name || '';
        const val = params.value ?? '-';
        return `${name}: ${
          metric === 'net_revenue' ? `$${Number(val).toFixed(2)}` : val
        }`;
      },
    },
    visualMap: {
      min: 0,
      max: Math.max(...mapData.map((d) => d.value), 1),
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: { color: ['#e0f3db', '#31a354'] },
    },
    series: [
      {
        type: 'map',
        map: 'world',
        roam: true,
        data: mapData.map((d) => ({ name: d.country, value: d.value })),
      },
    ],
  };

  // Top ranking bar chart
  const barOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const,
      data: [...topData].reverse().map((d) => d.country),
    },
    series: [
      {
        type: 'bar',
        data: [...topData].reverse().map((d) => d.value?.current ?? 0),
        barMaxWidth: 30,
        itemStyle: { color: '#1890ff' },
      },
    ],
  };

  const buildCompareCols = (
    title: string,
    field: string,
    isMoney = false,
    isRate = false,
  ): ColumnsType<GeoListItem> => {
    const cols: ColumnsType<GeoListItem> = [
      {
        title: hasCompare ? `${title}(当期)` : title,
        dataIndex: [field, 'current'],
        sorter: true,
        render: (val: number) => {
          if (val === null) return '-';
          if (isMoney) return `$${val.toFixed(2)}`;
          if (isRate) return `${val.toFixed(1)}%`;
          return val;
        },
      },
    ];
    if (hasCompare) {
      cols.push(
        {
          title: `${title}(对比)`,
          dataIndex: [field, 'compare'],
          render: (val: number) => {
            if (val === null) return '-';
            if (isMoney) return `$${val.toFixed(2)}`;
            if (isRate) return `${val.toFixed(1)}%`;
            return val;
          },
        },
        {
          title: '变化',
          dataIndex: [field, 'change_rate'],
          render: (val: number) => {
            if (val === null) return '-';
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

  const columns: ColumnsType<GeoListItem> = [
    { title: '国家', dataIndex: 'country', fixed: 'left', width: 100 },
    ...buildCompareCols('安装量', 'install_count'),
    ...buildCompareCols('试用量', 'trial_count'),
    ...buildCompareCols('付费订阅', 'subscribe_count'),
    ...buildCompareCols('净收入', 'net_revenue', true),
    ...buildCompareCols('ARPU', 'arpu', true),
    ...buildCompareCols('退款率', 'refund_rate', false, true),
  ];

  return (
    <PageContainer header={{ title: '地理分析' }}>
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
          style={{ width: 160 }}
          value={selectedChannel}
          onChange={setSelectedChannel}
          placeholder="全部渠道"
          allowClear
          options={channelOptions.map((c) => {
            const [key, label] = Object.entries(c)[0];
            return { label, value: key };
          })}
        />
        <Select
          size="large"
          value={metric}
          onChange={setMetric}
          options={metricOptions}
          style={{ width: 100 }}
        />
      </Space>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
              <Text strong>地图分布</Text>
              <ReactECharts option={mapOption} style={{ height: 400 }} />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
              <Text strong>Top 5 国家</Text>
              <ReactECharts option={barOption} style={{ height: 400 }} />
            </div>
          </Col>
        </Row>

        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <Text strong style={{ display: 'block', marginBottom: 16 }}>
            国家明细
          </Text>
          <Table
            columns={columns}
            dataSource={listData}
            rowKey="country"
            scroll={{ x: 1400 }}
            pagination={false}
            onChange={(_p, _f, sorter: any) => {
              if (sorter?.field) {
                const field = Array.isArray(sorter.field)
                  ? sorter.field[0]
                  : sorter.field;
                setSortField(field);
                setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
              }
            }}
            summary={() =>
              totalRow ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>{totalRow.country}</strong>
                    </Table.Summary.Cell>
                    {[
                      'install_count',
                      'trial_count',
                      'subscribe_count',
                      'net_revenue',
                      'arpu',
                      'refund_rate',
                    ].map((col, idx) => {
                      const data = totalRow[col as keyof GeoListItem] as any;
                      const isMoney = col === 'net_revenue' || col === 'arpu';
                      const isRate = col === 'refund_rate';
                      const cells = [];
                      const format = (v: number) => {
                        if (v === null) return '-';
                        if (isMoney) return `$${v.toFixed(2)}`;
                        if (isRate) return `${v.toFixed(1)}%`;
                        return v;
                      };
                      cells.push(
                        <Table.Summary.Cell
                          key={`${col}-cur`}
                          index={idx * (hasCompare ? 3 : 1) + 1}
                        >
                          <strong>{format(data?.current)}</strong>
                        </Table.Summary.Cell>,
                      );
                      if (hasCompare) {
                        cells.push(
                          <Table.Summary.Cell
                            key={`${col}-cmp`}
                            index={idx * 3 + 2}
                          >
                            {format(data?.compare)}
                          </Table.Summary.Cell>,
                          <Table.Summary.Cell
                            key={`${col}-chg`}
                            index={idx * 3 + 3}
                          >
                            {data?.change_rate !== null ? (
                              <span
                                style={{
                                  color:
                                    data.change_rate > 0
                                      ? '#52c41a'
                                      : data.change_rate < 0
                                      ? '#f5222d'
                                      : '#666',
                                }}
                              >
                                {data.change_rate > 0 ? '+' : ''}
                                {data.change_rate.toFixed(1)}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </Table.Summary.Cell>,
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

export default AnalyticsGeo;
