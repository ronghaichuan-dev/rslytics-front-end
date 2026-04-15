import CompareDatePicker, {
  type DateRange,
} from '@/components/CompareDatePicker';
import {
  getCustomQuery,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  getCountryOptions,
  type CustomQueryData,
  type CustomTemplateItem,
} from '@/services/analytics';
import { getAppSelectList } from '@/services/dashboard';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Col,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const dimensionOptions = [
  { label: '日期', value: 'stat_date' },
  { label: '应用', value: 'app_id' },
  { label: '渠道', value: 'tracker_network' },
  { label: '应用版本', value: 'app_version' },
  { label: '活动', value: 'campaign_id' },
  { label: '国家', value: 'country' },
];

const metricOptions = [
  { label: '安装量', value: 'install_count' },
  { label: '试用量', value: 'trial_count' },
  { label: '付费订阅', value: 'subscribe_count' },
  { label: '续订量', value: 'renew_count' },
  { label: '退款量', value: 'refund_count' },
  { label: '收入', value: 'revenue' },
  { label: '退款金额', value: 'refund_amount' },
  { label: '净收入', value: 'net_revenue' },
  { label: '安装→试用率', value: 'install_to_trial_rate' },
  { label: '试用→付费率', value: 'trial_to_paid_rate' },
  { label: '安装→付费率', value: 'install_to_paid_rate' },
  { label: 'ARPU', value: 'arpu' },
  { label: '退款率', value: 'refund_rate' },
];

const metricLabelMap: Record<string, string> = {};
metricOptions.forEach((o) => { metricLabelMap[o.value] = o.label; });
const dimLabelMap: Record<string, string> = {};
dimensionOptions.forEach((o) => { dimLabelMap[o.value] = o.label; });

const AnalyticsCustom: React.FC = () => {
  const [appList, setAppList] = useState<{ app_id: string; app_name: string }[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  });
  const [compareRange, setCompareRange] = useState<DateRange | undefined>();
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [dimensions, setDimensions] = useState<string[]>(['stat_date']);
  const [metrics, setMetrics] = useState<string[]>(['install_count', 'net_revenue']);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [queryData, setQueryData] = useState<CustomQueryData | null>(null);

  // Templates
  const [templates, setTemplates] = useState<CustomTemplateItem[]>([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    getAppSelectList().then((res) => {
      setAppList(res?.list || []);
    });
  }, []);

  const fetchTemplates = useCallback(() => {
    getCustomTemplates({ app_ids: selectedApps.join(',') || undefined }).then((res) => {
      setTemplates(res?.list || []);
    }).catch(() => {});
  }, [selectedApps]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchData = useCallback(async () => {
    if (dimensions.length === 0 || metrics.length === 0) return;
    setLoading(true);
    try {
      const result = await getCustomQuery({
        app_ids: selectedApps.join(',') || undefined,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        compare_start_date: compareRange?.startDate,
        compare_end_date: compareRange?.endDate,
        timezone,
        dimensions,
        metrics,
        sort_field: sortField,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      });
      setQueryData(result);
    } catch {
      // error already handled by response interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedApps, dateRange, compareRange, dimensions, metrics, sortField, sortOrder, page, pageSize, timezone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasCompare = !!compareRange;

  // Build table columns dynamically
  const buildColumns = (): ColumnsType<Record<string, any>> => {
    const cols: ColumnsType<Record<string, any>> = [];

    // Dimension columns
    for (const d of dimensions) {
      cols.push({
        title: dimLabelMap[d] || d,
        dataIndex: d,
        fixed: dimensions.indexOf(d) === 0 ? ('left' as const) : undefined,
        width: 120,
      });
    }

    // Metric columns
    for (const m of metrics) {
      const label = metricLabelMap[m] || m;
      const isRevenue = ['revenue', 'refund_amount', 'net_revenue', 'arpu'].includes(m);
      const isPct = ['install_to_trial_rate', 'trial_to_paid_rate', 'install_to_paid_rate', 'refund_rate'].includes(m);

      cols.push({
        title: hasCompare ? `${label}(当期)` : label,
        dataIndex: m,
        sorter: true,
        render: (val: number) => {
          if (val === undefined || val === null) return '-';
          if (isPct) return `${val.toFixed(1)}%`;
          if (isRevenue) return `$${val.toFixed(2)}`;
          return val;
        },
      });

      if (hasCompare) {
        cols.push(
          {
            title: `${label}(对比)`,
            dataIndex: `${m}_compare`,
            render: (val: number) => {
              if (val === undefined || val === null) return '-';
              if (isPct) return `${val.toFixed(1)}%`;
              if (isRevenue) return `$${val.toFixed(2)}`;
              return val;
            },
          },
          {
            title: '变化',
            dataIndex: `${m}_change_rate`,
            width: 80,
            render: (val: number) => {
              if (val === undefined || val === null) return '-';
              const color = val > 0 ? '#52c41a' : val < 0 ? '#f5222d' : '#666';
              return (
                <span style={{ color }}>
                  {val > 0 ? '+' : ''}{val.toFixed(1)}%
                </span>
              );
            },
          },
        );
      }
    }

    return cols;
  };

  const handleExport = useCallback(() => {
    const params: Record<string, string> = {
      app_ids: selectedApps.join(',') || '',
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    };
    if (compareRange?.startDate) params.compare_start_date = compareRange.startDate;
    if (compareRange?.endDate) params.compare_end_date = compareRange.endDate;
    // POST export - use form submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/admin/analytics/custom/query/export';
    form.target = '_blank';
    const addField = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };
    addField('app_ids', selectedApps.join(','));
    addField('start_date', dateRange.startDate);
    addField('end_date', dateRange.endDate);
    if (compareRange?.startDate) addField('compare_start_date', compareRange.startDate);
    if (compareRange?.endDate) addField('compare_end_date', compareRange.endDate);
    dimensions.forEach((d) => addField('dimensions[]', d));
    metrics.forEach((m) => addField('metrics[]', m));
    if (sortField) addField('sort_field', sortField);
    addField('sort_order', sortOrder);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }, [selectedApps, dateRange, compareRange, dimensions, metrics, sortField, sortOrder]);

  const handleApplyTemplate = (tpl: CustomTemplateItem) => {
    setDimensions(tpl.dimensions || []);
    setMetrics(tpl.metrics || []);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      message.warning('请输入模板名称');
      return;
    }
    await saveCustomTemplate({
      name: templateName,
      app_id: selectedApps[0] || '',
      dimensions,
      metrics,
    });
    message.success('模板已保存');
    setTemplateModalOpen(false);
    setTemplateName('');
    fetchTemplates();
  };

  const handleDeleteTemplate = async (id: number) => {
    await deleteCustomTemplate({ id });
    message.success('模板已删除');
    fetchTemplates();
  };

  return (
    <PageContainer header={{ title: '自定义报表' }}>
      {/* Filters */}
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
      </Space>

      {/* Dimension & Metric selectors */}
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={10}>
            <Text strong>维度 (1-3)</Text>
            <Select
              size="large"
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              value={dimensions}
              onChange={(vals) => setDimensions(vals.slice(0, 3))}
              options={dimensionOptions}
              placeholder="选择维度"
              maxTagCount={3}
            />
          </Col>
          <Col span={10}>
            <Text strong>指标</Text>
            <Select
              size="large"
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              value={metrics}
              onChange={setMetrics}
              options={metricOptions}
              placeholder="选择指标"
              maxTagCount={5}
            />
          </Col>
          <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Space>
              <Button size="large" type="primary" onClick={fetchData}>
                查询
              </Button>
              <Button size="large" onClick={() => setTemplateModalOpen(true)}>
                存为模板
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Templates */}
        {templates.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">模板: </Text>
            {templates.map((tpl) => (
              <Tag
                key={tpl.id}
                style={{ cursor: 'pointer', marginBottom: 4, fontSize: 14, padding: '4px 10px', lineHeight: '22px' }}
                onClick={() => handleApplyTemplate(tpl)}
                closable={tpl.is_preset === 0}
                onClose={(e) => {
                  e.preventDefault();
                  handleDeleteTemplate(tpl.id);
                }}
              >
                {tpl.name}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* Data Table */}
      <Spin spinning={loading}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text strong>查询结果</Text>
            <Button onClick={handleExport} disabled={!queryData?.rows?.length}>
              导出 CSV
            </Button>
          </div>
          <Table
            columns={buildColumns()}
            dataSource={queryData?.rows || []}
            rowKey={(_, idx) => String(idx)}
            scroll={{ x: 800 + metrics.length * (hasCompare ? 240 : 120) }}
            pagination={{
              current: page,
              pageSize,
              total: queryData?.total_count || 0,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            onChange={(_p, _f, sorter: any) => {
              if (sorter?.field) {
                setSortField(sorter.field as string);
                setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
              }
            }}
            summary={() => {
              if (!queryData?.total || Object.keys(queryData.total).length === 0) return undefined;
              const total = queryData.total;
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    {dimensions.map((d, i) => (
                      <Table.Summary.Cell key={d} index={i}>
                        {i === 0 ? <strong>合计</strong> : ''}
                      </Table.Summary.Cell>
                    ))}
                    {metrics.map((m, idx) => {
                      const val = total[m] as number;
                      const isRevenue = ['revenue', 'refund_amount', 'net_revenue', 'arpu'].includes(m);
                      const isPct = ['install_to_trial_rate', 'trial_to_paid_rate', 'install_to_paid_rate', 'refund_rate'].includes(m);
                      const baseIdx = dimensions.length + idx * (hasCompare ? 3 : 1);
                      const cells = [
                        <Table.Summary.Cell key={`${m}-val`} index={baseIdx}>
                          <strong>
                            {val === undefined || val === null
                              ? '-'
                              : isPct
                                ? `${val.toFixed(1)}%`
                                : isRevenue
                                  ? `$${val.toFixed(2)}`
                                  : val}
                          </strong>
                        </Table.Summary.Cell>,
                      ];
                      if (hasCompare) {
                        cells.push(
                          <Table.Summary.Cell key={`${m}-cmp`} index={baseIdx + 1}>-</Table.Summary.Cell>,
                          <Table.Summary.Cell key={`${m}-chg`} index={baseIdx + 2}>-</Table.Summary.Cell>,
                        );
                      }
                      return cells;
                    })}
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      </Spin>

      {/* Save Template Modal */}
      <Modal
        title="保存为模板"
        open={templateModalOpen}
        onOk={handleSaveTemplate}
        onCancel={() => setTemplateModalOpen(false)}
      >
        <Input
          placeholder="模板名称"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <div style={{ marginTop: 12, color: '#999' }}>
          维度: {dimensions.map((d) => dimLabelMap[d] || d).join(', ')}
          <br />
          指标: {metrics.map((m) => metricLabelMap[m] || m).join(', ')}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default AnalyticsCustom;
