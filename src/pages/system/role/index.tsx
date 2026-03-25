import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Form, Input, message, Modal, Popconfirm, Switch, Tree } from 'antd';
import { useRef, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import {
  getPermissionTree,
  type Permission,
} from '../../../services/permission';
import {
  createRole,
  deleteRole,
  getRoleList,
  updateRole,
  updateRoleStatus,
  type Role,
} from '../../../services/role';
import {
  assignRolePermissions,
  getRolePermissions,
} from '../../../services/rolePermission';

function buildTreeData(list: Permission[]): any[] {
  return list.map((p) => ({
    key: p.id,
    title: `${p.permission_name} (${p.permission_code})`,
    children: p.children ? buildTreeData(p.children) : [],
  }));
}

export default function RolePage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [assignModal, setAssignModal] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);
  const [permTree, setPermTree] = useState<Permission[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Role) => {
    setEditRecord(record);
    form.setFieldsValue({
      role_name: record.role_name,
      role_code: record.role_code,
      role_desc: record.role_desc,
    });
    setModalOpen(true);
  };

  const openAssign = async (record: Role) => {
    setAssignRoleId(record.id);
    try {
      const [treeRes, permRes] = await Promise.all([
        getPermissionTree(),
        getRolePermissions(record.id),
      ]);
      setPermTree(treeRes.tree ?? []);
      setCheckedKeys((permRes.permissions ?? []).map((p) => p.id));
    } catch {
      setCheckedKeys([]);
    }
    setAssignModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleStatusChange = async (record: Role, checked: boolean) => {
    try {
      await updateRoleStatus({ id: record.id, status: checked ? 1 : 2 });
      message.success('状态更新成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await updateRole({ id: editRecord.id, ...values });
        message.success('更新成功');
      } else {
        await createRole(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!assignRoleId) return;
    try {
      await assignRolePermissions({
        role_id: assignRoleId,
        permission_ids: checkedKeys,
      });
      message.success('权限分配成功');
      setAssignModal(false);
    } catch {}
  };

  const columns: ProColumns<Role>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '角色名', dataIndex: 'role_name', ellipsis: true },
    { title: '角色码', dataIndex: 'role_code', ellipsis: true, search: false },
    { title: '描述', dataIndex: 'role_desc', ellipsis: true, search: false },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'status',
      search: false,
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.status === 1}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
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
      width: 200,
      render: (_, record) => (
        <>
          <AccessButton
            permissionCode="role:update"
            type="link"
            size="small"
            onClick={() => openEdit(record)}
          >
            {intl.formatMessage({ id: 'common.edit' })}
          </AccessButton>
          <AccessButton
            permissionCode="role:assign"
            type="link"
            size="small"
            onClick={() => openAssign(record)}
          >
            分配权限
          </AccessButton>
          <Popconfirm
            title={intl.formatMessage({ id: 'common.deleteConfirm' })}
            onConfirm={() => handleDelete(record.id)}
          >
            <AccessButton
              permissionCode="role:delete"
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
      <ProTable<Role>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getRoleList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="role:create"
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
          <Form.Item
            name="role_name"
            label="角色名"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role_code"
            label="角色码"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role_desc" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配权限"
        open={assignModal}
        onOk={handleAssign}
        onCancel={() => setAssignModal(false)}
        width={520}
      >
        <Tree
          checkable
          treeData={buildTreeData(permTree)}
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as number[])}
          style={{ maxHeight: 400, overflowY: 'auto' }}
        />
      </Modal>
    </>
  );
}
