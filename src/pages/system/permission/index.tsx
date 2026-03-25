import { useIntl } from '@umijs/max';
import {
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tree,
} from 'antd';
import { useEffect, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import {
  createPermission,
  deletePermission,
  disablePermission,
  enablePermission,
  getPermissionTree,
  updatePermission,
  type Permission,
} from '../../../services/permission';

function buildTreeData(
  list: Permission[],
  onEdit: (p: Permission) => void,
  onDelete: (id: number) => void,
  onToggle: (p: Permission) => void,
  intl: any,
): any[] {
  return list.map((p) => ({
    key: p.id,
    title: (
      <Space>
        <span>{p.permission_name}</span>
        <span style={{ color: '#999', fontSize: 12 }}>
          ({p.permission_code})
        </span>
        <AccessButton
          permissionCode="permission:update"
          type="link"
          size="small"
          onClick={() => onEdit(p)}
        >
          {intl.formatMessage({ id: 'common.edit' })}
        </AccessButton>
        <AccessButton
          permissionCode="permission:update"
          type="link"
          size="small"
          onClick={() => onToggle(p)}
        >
          {p.status === 1
            ? intl.formatMessage({ id: 'common.disable' })
            : intl.formatMessage({ id: 'common.enable' })}
        </AccessButton>
        <Popconfirm
          title={intl.formatMessage({ id: 'common.deleteConfirm' })}
          onConfirm={() => onDelete(p.id)}
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
    children: p.children
      ? buildTreeData(p.children, onEdit, onDelete, onToggle, intl)
      : [],
  }));
}

function flattenTree(list: Permission[]): Permission[] {
  const result: Permission[] = [];
  const walk = (items: Permission[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children) walk(item.children);
    }
  };
  walk(list);
  return result;
}

export default function PermissionPage() {
  const intl = useIntl();
  const [tree, setTree] = useState<Permission[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Permission | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const loadTree = async () => {
    try {
      const res = await getPermissionTree();
      setTree(res.list ?? []);
    } catch {}
  };

  useEffect(() => {
    loadTree();
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (p: Permission) => {
    setEditRecord(p);
    form.setFieldsValue({
      permission_name: p.permission_name,
      permission_code: p.permission_code,
      module: p.module,
      route: p.route,
      parent_id: p.parent_id,
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

  const handleToggle = async (p: Permission) => {
    try {
      if (p.status === 1) {
        await disablePermission(p.id);
      } else {
        await enablePermission(p.id);
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

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <AccessButton
          permissionCode="permission:create"
          type="primary"
          onClick={openCreate}
        >
          {intl.formatMessage({ id: 'common.create' })}
        </AccessButton>
      </div>
      <Tree
        treeData={buildTreeData(
          tree,
          openEdit,
          handleDelete,
          handleToggle,
          intl,
        )}
        defaultExpandAll
        blockNode
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
            name="permission_name"
            label="权限名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="permission_code"
            label="权限码"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="module" label="模块" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="route" label="路由">
            <Input />
          </Form.Item>
          <Form.Item name="parent_id" label="父权限">
            <Select allowClear placeholder="请选择父权限（可选）">
              {flatList.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.permission_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
