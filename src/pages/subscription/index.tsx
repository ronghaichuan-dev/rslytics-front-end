import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
} from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import AccessButton from '../../components/AccessButton';
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionDetail,
  getSubscriptionList,
  updateSubscription,
  type Subscription,
} from '../../services/subscription';

export default function SubscriptionPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Subscription | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<Subscription | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Subscription) => {
    setEditRecord(record);
    form.setFieldsValue({
      country: record.country,
      user_id: record.user_id,
      device_id: record.device_id,
      subscription_fee: record.subscription_fee,
      subscribed_at: record.subscribed_at
        ? dayjs(record.subscribed_at)
        : undefined,
    });
    setModalOpen(true);
  };

  const openDetail = async (record: Subscription) => {
    try {
      const res = await getSubscriptionDetail(record.id);
      setDetail(res);
      setDrawerOpen(true);
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSubscription(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      subscribed_at: values.subscribed_at?.toISOString(),
    };
    setSubmitting(true);
    try {
      if (editRecord) {
        await updateSubscription({ id: editRecord.id, ...payload });
        message.success('更新成功');
      } else {
        await createSubscription(payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
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
      width: 180,
      render: (_, record) => (
        <>
          <AccessButton
            permissionCode="subscription:update"
            type="link"
            size="small"
            onClick={() => openEdit(record)}
          >
            {intl.formatMessage({ id: 'common.edit' })}
          </AccessButton>
          <AccessButton
            permissionCode="subscription:list"
            type="link"
            size="small"
            onClick={() => openDetail(record)}
          >
            详情
          </AccessButton>
          <Popconfirm
            title={intl.formatMessage({ id: 'common.deleteConfirm' })}
            onConfirm={() => handleDelete(record.id)}
          >
            <AccessButton
              permissionCode="subscription:delete"
              type="link"
              size="small"
              danger
            >
              {intl.formatMessage({ id: 'common.delete' })}
            </AccessButton>
          </Popconfirm>
        </>
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
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="subscription:create"
            type="primary"
            onClick={openCreate}
          >
            {intl.formatMessage({ id: 'common.create' })}
          </AccessButton>,
        ]}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={
          editRecord
            ? intl.formatMessage({ id: 'common.edit' })
            : intl.formatMessage({ id: 'common.create' })
        }
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          {!editRecord && (
            <>
              <Form.Item
                name="app_id"
                label="App ID"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="event_id"
                label="事件ID"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
          <Form.Item name="country" label="国家">
            <Input />
          </Form.Item>
          <Form.Item name="user_id" label="用户ID">
            <Input />
          </Form.Item>
          <Form.Item name="device_id" label="设备ID">
            <Input />
          </Form.Item>
          <Form.Item name="subscription_fee" label="订阅费">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="subscribed_at" label="订阅时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

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
