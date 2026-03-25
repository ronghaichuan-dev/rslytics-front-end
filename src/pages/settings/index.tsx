import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Form, Input, message, Modal, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import AccessButton from '../../components/AccessButton';
import {
  createSystemSetting,
  deleteSystemSetting,
  getSystemSettingList,
  updateSystemSetting,
  type SystemSetting,
} from '../../services/systemSetting';

export default function SettingsPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SystemSetting | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: SystemSetting) => {
    setEditRecord(record);
    form.setFieldsValue({ key: record.key, value: record.value });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSystemSetting(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await updateSystemSetting({ id: editRecord.id, ...values });
        message.success('更新成功');
      } else {
        await createSystemSetting(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<SystemSetting>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: 'Key', dataIndex: 'key', ellipsis: true },
    {
      title: 'Value',
      dataIndex: 'value',
      search: false,
      ellipsis: true,
      render: (v) => {
        const str = String(v);
        return str.length > 50 ? str.slice(0, 50) + '...' : str;
      },
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
            permissionCode="settings:update"
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
              permissionCode="settings:delete"
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
      <ProTable<SystemSetting>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getSystemSettingList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="settings:create"
            type="primary"
            onClick={openCreate}
          >
            {intl.formatMessage({ id: 'common.create' })}
          </AccessButton>,
        ]}
        search={false}
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
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
