import { useIntl } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import {
  createPermission,
  deletePermission,
  disablePermission,
  enablePermission,
  getPermissionTree,
  type Permission,
  updatePermission,
} from '../../../services/permission';

function flattenTree(list: Permission[]): Permission[] {
  const result: Permission[] = [];
  const walk = (items: Permission[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(list);
  return result;
}

export default function PermissionPage() {
  const intl = useIntl();
  const [tree, setTree] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Permission | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const loadTree = async () => {
    setLoading(true);
    try {
      const res = await getPermissionTree();
      setTree(res.tree ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const openCreate = (parentId?: number) => {
    setEditRecord(null);
    form.resetFields();
    if (parentId) {
      form.setFieldValue('parent_id', parentId);
    }
    setModalOpen(true);
  };

  const openEdit = (record: Permission) => {
    setEditRecord(record);
    form.setFieldsValue({
      permission_name: record.permission_name,
      permission_code: record.permission_code,
      module: record.module,
      route: record.route,
      parent_id: record.parent_id || undefined,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePermission(id);
      message.success('删除成功');
      loadTree();
    } catch {}
  };

  const handleToggle = async (record: Permission) => {
    try {
      if (record.status === 1) {
        await disablePermission(record.id);
      } else {
        await enablePermission(record.id);
      }
      message.success('状态更新成功');
      loadTree();
    } catch {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await updatePermission({ id: editRecord.id, ...values });
        message.success('更新成功');
      } else {
        await createPermission(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadTree();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const flatList = flattenTree(tree);

  const columns: ColumnsType<Permission> = [
    {
      title: '权限名称',
      dataIndex: 'permission_name',
      width: 200,
    },
    {
      title: '权限码',
      dataIndex: 'permission_code',
      width: 180,
      render: (val) => <code style={{ fontSize: 12 }}>{val}</code>,
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 120,
    },
    {
      title: '路由',
      dataIndex: 'route',
      ellipsis: true,
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 70,
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'success' : 'default'}>
          {record.status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      width: 230,
      render: (_, record) => (
        <Space size={0}>
          <AccessButton
            permissionCode="permission:update"
            type="link"
            size="small"
            onClick={() => openEdit(record)}
          >
            {intl.formatMessage({ id: 'common.edit' })}
          </AccessButton>
          <AccessButton
            permissionCode="permission:create"
            type="link"
            size="small"
            onClick={() => openCreate(record.id)}
          >
            添加子权限
          </AccessButton>
          <AccessButton
            permissionCode="permission:update"
            type="link"
            size="small"
            onClick={() => handleToggle(record)}
          >
            {record.status === 1
              ? intl.formatMessage({ id: 'common.disable' })
              : intl.formatMessage({ id: 'common.enable' })}
          </AccessButton>
          <Popconfirm
            title={intl.formatMessage({ id: 'common.deleteConfirm' })}
            onConfirm={() => handleDelete(record.id)}
          >
            <AccessButton
              permissionCode="permission:delete"
              type="link"
              size="small"
              danger
            >
              {intl.formatMessage({ id: 'common.delete' })}
            </AccessButton>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <AccessButton
          permissionCode="permission:create"
          type="primary"
          onClick={() => openCreate()}
        >
          {intl.formatMessage({ id: 'common.create' })}
        </AccessButton>
      </div>

      <Table<Permission>
        rowKey="id"
        columns={columns}
        dataSource={tree}
        loading={loading}
        pagination={false}
        defaultExpandAllRows
        size="small"
        bordered
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
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="permission_name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="permission_code"
            label="权限码"
            rules={[{ required: true, message: '请输入权限码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="module"
            label="模块"
            rules={[{ required: true, message: '请输入模块名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="route" label="路由">
            <Input />
          </Form.Item>
          <Form.Item name="parent_id" label="父级权限">
            <Select allowClear placeholder="顶级权限（可选）">
              {flatList.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {'  '.repeat((p.level ?? 1) - 1)}
                  {p.permission_name} ({p.permission_code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
