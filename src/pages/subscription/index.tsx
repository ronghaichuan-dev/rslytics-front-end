import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Descriptions, Drawer, Tag, Space } from 'antd';
import { useRef, useState } from 'react';
import {
  getSubscriptionDetail,
  getSubscriptionList,
  type Subscription,
} from '../../services/subscription';
import { getAppSelectList } from '../../services/dashboard';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '已激活', color: 'green' },
  2: { label: '已过期', color: 'red' },
  3: { label: '计费重试期', color: 'orange' },
  4: { label: '账单宽限期', color: 'orange' },
  5: { label: '已取消', color: 'default' },
};

const AUTO_RENEW_STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '启用', color: 'green' },
  2: { label: '禁用', color: 'red' },
};

const IS_TRIAL_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '是', color: 'blue' },
  2: { label: '否', color: 'default' },
};

const IS_PAID_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '是', color: 'green' },
  2: { label: '否', color: 'default' },
};

const STATUS_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '已激活', value: 1 },
  { label: '已过期', value: 2 },
  { label: '计费重试期', value: 3 },
  { label: '账单宽限期', value: 4 },
  { label: '已取消', value: 5 },
];

const AUTO_RENEW_STATUS_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
];

const formatTimestamp = (ts: number): string => {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function SubscriptionPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [detail, setDetail] = useState<Subscription | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDetail = async (record: Subscription) => {
    try {
      const res = await getSubscriptionDetail(record.id);
      setDetail(res);
      setDrawerOpen(true);
    } catch {}
  };

  const columns: ProColumns<Subscription>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    {
      title: 'App ID',
      dataIndex: 'appId',
      ellipsis: true,
      width: 120,
      valueType: 'select',
      request: async () => {
        const res = await getAppSelectList();
        return res.list.map((item) => ({
          label: `${item.app_id} (${item.app_name})`,
          value: item.app_id,
        }));
      },
      fieldProps: { allowClear: true, placeholder: '请选择' },
    },
    { title: '产品ID', dataIndex: 'productId', ellipsis: true, search: false, width: 120 },
    {
      title: '订阅状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      fieldProps: { allowClear: true, placeholder: '请选择' },
      valueEnum: {
        0: { text: '全部', status: 'Default' },
        1: { text: '已激活', status: 'Success' },
        2: { text: '已过期', status: 'Error' },
        3: { text: '计费重试期', status: 'Warning' },
        4: { text: '账单宽限期', status: 'Warning' },
        5: { text: '已取消', status: 'Default' },
      },
      render: (_, record) => {
        const status = STATUS_MAP[record.status] || { label: '未知', color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '自动续费',
      dataIndex: 'autoRenewStatus',
      valueType: 'select',
      width: 80,
      fieldProps: { allowClear: true, placeholder: '请选择' },
      valueEnum: {
        0: { text: '全部', status: 'Default' },
        1: { text: '启用', status: 'Success' },
        2: { text: '禁用', status: 'Error' },
      },
      render: (_, record) => {
        const status = AUTO_RENEW_STATUS_MAP[record.autoRenewStatus] || { label: '未知', color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '试订',
      dataIndex: 'isTrial',
      search: false,
      width: 60,
      render: (_, record) => {
        const trial = IS_TRIAL_MAP[record.isTrial] || { label: '未知', color: 'default' };
        return <Tag color={trial.color}>{trial.label}</Tag>;
      },
    },
    {
      title: '已付费',
      dataIndex: 'isPaid',
      search: false,
      width: 70,
      render: (_, record) => {
        const paid = IS_PAID_MAP[record.isPaid] || { label: '未知', color: 'default' };
        return <Tag color={paid.color}>{paid.label}</Tag>;
      },
    },
    { title: '环境', dataIndex: 'environment', search: false, width: 80 },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      search: false,
      width: 180,
      render: (_, record) => formatTimestamp(record.createdAt),
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      search: false,
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <ProTable<Subscription>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getSubscriptionList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            app_id: params.appId,
            status: params.status && params.status !== 0 ? Number(params.status) : undefined,
            auto_renew_status: params.autoRenewStatus && params.autoRenewStatus !== 0 ? Number(params.autoRenewStatus) : undefined,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={false}
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 20 }}
      />

      <Drawer
        title="订阅详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="App ID">{detail.appId}</Descriptions.Item>
            <Descriptions.Item label="产品ID">{detail.productId}</Descriptions.Item>
            <Descriptions.Item label="原始交易ID">
              {detail.orignialTransactionId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="用户设备ID">{detail.rsid || '-'}</Descriptions.Item>
            <Descriptions.Item label="环境">{detail.environment || '-'}</Descriptions.Item>
            <Descriptions.Item label="订阅状态">
              <Space>
                <Tag color={STATUS_MAP[detail.status]?.color || 'default'}>
                  {STATUS_MAP[detail.status]?.label || '未知'}
                </Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="自动续费状态">
              <Tag color={AUTO_RENEW_STATUS_MAP[detail.autoRenewStatus]?.color || 'default'}>
                {AUTO_RENEW_STATUS_MAP[detail.autoRenewStatus]?.label || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="是否试订">
              <Tag color={IS_TRIAL_MAP[detail.isTrial]?.color || 'default'}>
                {IS_TRIAL_MAP[detail.isTrial]?.label || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="是否付费">
              <Tag color={IS_PAID_MAP[detail.isPaid]?.color || 'default'}>
                {IS_PAID_MAP[detail.isPaid]?.label || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优惠类型">{detail.offerType || '-'}</Descriptions.Item>
            <Descriptions.Item label="优惠ID">{detail.offerId || '-'}</Descriptions.Item>
            <Descriptions.Item label="过期原因">
              {detail.expiresReason || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="过期时间">
              {formatTimestamp(detail.expiresAt)}
            </Descriptions.Item>
            <Descriptions.Item label="撤销时间">
              {formatTimestamp(detail.revocationDate)}
            </Descriptions.Item>
            <Descriptions.Item label="撤销原因">
              {detail.revocationReason || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="上次事件时间">
              {formatTimestamp(detail.lastEventAt)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatTimestamp(detail.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatTimestamp(detail.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}