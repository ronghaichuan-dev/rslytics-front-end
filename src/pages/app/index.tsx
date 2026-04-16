import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Upload,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import AccessButton from '../../components/AccessButton';
import { getBackendAssetUrl } from '../../constants/api';
import {
  createApp,
  deleteApp,
  getAppList,
  getAppToken,
  updateApp,
  uploadFile,
  type App,
} from '../../services/app';
import { getCompanySelectList, type Company } from '../../services/company';

export default function AppPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<App | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    getCompanySelectList()
      .then((res) => setCompanyList(res.list ?? []))
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
      app_type: record.app_type,
      app_name: record.app_name,
      app_id: record.app_id,
      bundle_id: record.bundle_id,
      company_id: record.company_id,
      subscription_fee: record.subscription_fee,
    });
    setModalOpen(true);
  };

  const handleDelete = async (app_id: string) => {
    try {
      await deleteApp(app_id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleUpload = async (file: File): Promise<boolean> => {
    try {
      const res = await uploadFile(file);
      const url = getBackendAssetUrl(res.url);
      setIconUrl(url);
      form.setFieldValue('icon', url);
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
          app_id: editRecord.app_id,
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
    {
      title: '图标',
      dataIndex: 'icon',
      width: 60,
      search: false,
      render: (_, record) =>
        record.icon ? <Image src={record.icon} width={32} height={32} /> : '-',
    },
    { title: '应用类型', dataIndex: 'app_type', ellipsis: true, search: false },
    { title: '应用ID', dataIndex: 'app_id', ellipsis: true },
    { title: '包名', dataIndex: 'bundle_id', ellipsis: true },
    { title: '应用名', dataIndex: 'app_name', ellipsis: true, search: false },
    {
      title: '所属公司',
      dataIndex: 'company_name',
      ellipsis: true,
      search: false,
    },
    {
      title: 'AppToken',
      dataIndex: 'app_token',
      search: false,
      ellipsis: true,
      render: (_, record) =>
        record.app_token ? (
          <span>
            <CopyOutlined
              style={{ cursor: 'pointer', color: '#1890ff' }}
              onClick={async () => {
                try {
                  const res = await getAppToken(record.app_id);
                  const token = res.token ?? res.app_token ?? record.app_token;
                  if (!token) throw new Error('empty token');
                  await navigator.clipboard.writeText(token);
                  message.success('已复制');
                } catch {
                  message.error('获取Token失败');
                }
              }}
            />{' '}
            {record.app_token}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: intl.formatMessage({ id: 'common.createTime' }),
      dataIndex: 'created_at',
      search: false,
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
            onConfirm={() => handleDelete(record.app_id)}
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
        rowKey="app_id"
        columns={columns}
        request={async (params) => {
          const res = await getAppList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            app_id: params.app_id,
            app_name: params.app_name,
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
          <Form.Item
            name="app_type"
            label="应用类型"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="请选择应用类型"
              showSearch
              optionFilterProp="children"
            >
              <Select.Option key="android" value="android">
                Android
              </Select.Option>
              <Select.Option key="ios" value="ios">
                IOS
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="app_id" label="AppID" rules={[{ required: true }]}>
            <Input disabled={!!editRecord} />
          </Form.Item>
          <Form.Item
            name="bundle_id"
            label="BundleId"
            rules={[{ required: true }]}
          >
            <Input disabled={!!editRecord} />
          </Form.Item>
          <Form.Item
            name="app_name"
            label="应用名"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="company_id"
            label="所属公司"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="请选择公司"
              showSearch
              optionFilterProp="children"
            >
              {companyList.map((company) => (
                <Select.Option key={company.id} value={company.id}>
                  {company.company_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item name="subscription_fee" label="订阅费">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item> */}
          <Form.Item label="图标">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {iconUrl && (
                <Image
                  src={iconUrl}
                  width={64}
                  height={64}
                  style={{ borderRadius: 6, border: '1px solid #d9d9d9' }}
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
                  {iconUrl ? '更换图标' : '上传图标'}
                </AccessButton>
              </Upload>
            </div>
          </Form.Item>
          {/* <Form.Item name="events" label="绑定事件">
            <Select mode="multiple" placeholder="请选择事件">
              {eventList.map((e) => (
                <Select.Option key={e.id} value={e.id}>
                  {e.event_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
}
