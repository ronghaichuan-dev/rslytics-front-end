import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Descriptions, Drawer } from 'antd';
import { useRef, useState } from 'react';
import {
  getSubscriptionDetail,
  getSubscriptionList,
  type Subscription,
} from '../../services/subscription';

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
    { title: 'App ID', dataIndex: 'app_id', ellipsis: true },
    {
      title: '事件类型',
      dataIndex: 'event_type',
      search: false,
      ellipsis: true,
    },
    { title: '国家', dataIndex: 'country', ellipsis: true },
    { title: '用户ID', dataIndex: 'user_id', ellipsis: true },
    { title: '设备ID', dataIndex: 'device_id', search: false, ellipsis: true },
    {
      title: '订阅费',
      dataIndex: 'subscription_fee',
      search: false,
      width: 100,
    },
    {
      title: '订阅时间',
      dataIndex: 'subscribed_at',
      search: false,
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      search: false,
      width: 100,
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
            app_id: params.app_id,
            event_id: params.event_id ? Number(params.event_id) : undefined,
            country: params.country,
            user_id: params.user_id,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={false}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 20 }}
      />

      <Drawer
        title="订阅详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="App ID">
              {detail.app_id}
            </Descriptions.Item>
            <Descriptions.Item label="事件类型">
              {detail.event_type ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="国家">
              {detail.country ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {detail.user_id ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="设备ID">
              {detail.device_id ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="订阅费">
              {detail.subscription_fee ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="订阅时间">
              {detail.subscribed_at ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detail.created_at}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
