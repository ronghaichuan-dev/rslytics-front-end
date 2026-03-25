import { UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Upload,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import AccessButton from '../../components/AccessButton';
import {
  createApp,
  deleteApp,
  getAppList,
  updateApp,
  uploadFile,
  type App,
} from '../../services/app';
import { getEventDropdown, type EventDropdownItem } from '../../services/event';

export default function AppPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<App | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [eventList, setEventList] = useState<EventDropdownItem[]>([]);
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    getEventDropdown()
      .then((res) => setEventList(res.list ?? []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    setIconUrl('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: App) => {
    setEditRecord(record);
    setIconUrl(record.icon ?? '');
    form.setFieldsValue({
      app_name: record.app_name,
      appid: record.appid,
      subscription_fee: record.subscription_fee,
      event_ids: record.event_ids ?? [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteApp(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleUpload = async (file: File): Promise<boolean> => {
    try {
      const res = await uploadFile(file);
      setIconUrl(res.url);
      form.setFieldValue('icon', res.url);
      message.success('上传成功');
    } catch {}
    return false;
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await updateApp({
          id: editRecord.id,
          ...values,
          icon: iconUrl || undefined,
        });
        message.success('更新成功');
      } else {
        await createApp({ ...values, icon: iconUrl || undefined });
        message.success('创建成功');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<App>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 60,
      search: false,
      render: (_, record) =>
        record.icon ? <Image src={record.icon} width={32} height={32} /> : '-',
    },
    { title: 'AppID', dataIndex: 'appid', ellipsis: true },
    { title: '应用名', dataIndex: 'app_name', ellipsis: true },
    {
      title: '订阅费',
      dataIndex: 'subscription_fee',
      search: false,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'common.createTime' }),
      dataIndex: 'created_at',
      search: false,
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      search: false,
      width: 140,
      render: (_, record) => (
        <>
          <AccessButton
            permissionCode="app:update"
            type="link"
            size="small"
            onClick={() => openEdit(record)}
          >
            {intl.formatMessage({ id: 'common.edit' })}
          </AccessButton>
          <Popconfirm
            title={intl.formatMessage({ id: 'common.deleteConfirm' })}
            onConfirm={() => handleDelete(record.id)}
          >
            <AccessButton
              permissionCode="app:delete"
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
      <ProTable<App>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getAppList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            keyword: params.appid || params.app_name,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="app:create"
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
          <Form.Item name="appid" label="AppID" rules={[{ required: true }]}>
            <Input disabled={!!editRecord} />
          </Form.Item>
          <Form.Item
            name="app_name"
            label="应用名"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="subscription_fee" label="订阅费">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="图标">
            {iconUrl && (
              <Image
                src={iconUrl}
                width={64}
                height={64}
                style={{ marginBottom: 8, display: 'block' }}
              />
            )}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleUpload}
            >
              <AccessButton
                permissionCode={editRecord ? 'app:update' : 'app:create'}
                icon={<UploadOutlined />}
              >
                上传图标
              </AccessButton>
            </Upload>
          </Form.Item>
          <Form.Item name="event_ids" label="绑定事件">
            <Select mode="multiple" placeholder="请选择事件">
              {eventList.map((e) => (
                <Select.Option key={e.id} value={e.id}>
                  {e.event_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
