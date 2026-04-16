import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import {
  getCampaignList,
  getChannelOptions,
  getCountryOptions,
  type CampaignListItem,
  type RsNetworkItem,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import { Input, Select, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const renderChangeRate = (rate?: number) => {
  if (rate === null) return '-';
  const color = rate > 0 ? '#52c41a' : rate < 0 ? '#f5222d' : '#666';
  return (
    <span style={{ color }}>
      {rate > 0 ? '+' : ''}
      {rate.toFixed(1)}%
    </span>
  );
};

const AnalyticsCampaign: React.FC = () => {
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
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [channelOptions, setChannelOptions] = useState<RsNetworkItem[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<CampaignListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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

  useEffect(() => {
    getCountryOptions({ app_ids: selectedApps.join(',') || undefined })
      .then((res) => {
        setCountryOptions(res?.list || []);
      })
      .catch(() => {});
  }, [selectedApps]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCampaignList({
        app_ids: selectedApps.join(',') || undefined,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        compare_start_date: compareRange?.startDate,
        compare_end_date: compareRange?.endDate,
        timezone,
        countries:
          selectedCountries.length > 0
            ? selectedCountries.join(',')
            : undefined,
        tracker_network: selectedChannel || undefined,
        keyword: keyword || undefined,
        sort_field: sortField,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      });
      setListData(res?.list || []);
      setTotal(res?.total || 0);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [
    selectedApps,
    dateRange,
    compareRange,
    selectedCountries,
    selectedChannel,
    keyword,
    sortField,
    sortOrder,
    page,
    pageSize,
    timezone,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasCompare = !!compareRange;

  const buildCompareCols = (
    title: string,
    field: keyof CampaignListItem,
    isMoney = false,
    isRate = false,
  ): ColumnsType<CampaignListItem> => {
    const cols: ColumnsType<CampaignListItem> = [
      {
        title: hasCompare ? `${title}(当期)` : title,
        dataIndex: [field as string, 'current'],
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
          dataIndex: [field as string, 'compare'],
          render: (val: number) => {
            if (val === null) return '-';
            if (isMoney) return `$${val.toFixed(2)}`;
            if (isRate) return `${val.toFixed(1)}%`;
            return val;
          },
        },
        {
          title: '变化',
          dataIndex: [field as string, 'change_rate'],
          render: renderChangeRate,
        },
      );
    }
    return cols;
  };

  const columns: ColumnsType<CampaignListItem> = [
    { title: '活动 ID', dataIndex: 'campaign_id', fixed: 'left', width: 200 },
    { title: '渠道', dataIndex: 'tracker_network', width: 120 },
    ...buildCompareCols('安装量', 'install_count'),
    ...buildCompareCols('试用量', 'trial_count'),
    ...buildCompareCols('付费订阅', 'subscribe_count'),
    ...buildCompareCols('净收入', 'net_revenue', true),
    ...buildCompareCols('安装→付费率', 'install_to_paid_rate', false, true),
  ];

  return (
    <PageContainer header={{ title: '活动分析' }}>
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
        <Input.Search
          size="large"
          placeholder="活动名称/ID"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={() => {
            setPage(1);
            fetchData();
          }}
          allowClear
          style={{ width: 200 }}
        />
      </Space>

      <Spin spinning={loading}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <Text strong style={{ marginBottom: 16, display: 'block' }}>
            活动列表
          </Text>
          <Table
            columns={columns}
            dataSource={listData}
            rowKey="campaign_id"
            scroll={{ x: 1600 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            onChange={(_p, _f, sorter: any) => {
              if (sorter?.field) {
                const field = Array.isArray(sorter.field)
                  ? sorter.field[0]
                  : sorter.field;
                setSortField(field);
                setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
              }
            }}
          />
        </div>
      </Spin>
    </PageContainer>
  );
};

export default AnalyticsCampaign;
