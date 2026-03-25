import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import { getRoleSelectList, type RoleSelectItem } from '../../../services/role';
import {
  createUser,
  deleteUser,
  getUserDetail,
  getUserList,
  updateUser,
  type User,
  type UserDetail,
} from '../../../services/user';

export default function UserPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<User | null>(null);
  const [roleList, setRoleList] = useState<RoleSelectItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [detailRecord, setDetailRecord] = useState<UserDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    getRoleSelectList()
      .then((res) => setRoleList(res.list ?? []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEdit = (record: User) => {
    setEditRecord(record);
    form.setFieldsValue({ username: record.username, role_id: record.role_id });
    setDrawerOpen(true);
  };

  const openDetail = async (record: User) => {
    try {
      const res = await getUserDetail(record.id);
      setDetailRecord(res.user);
      setDetailOpen(true);
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await updateUser({ id: editRecord.id, ...values });
        message.success('更新成功');
      } else {
        await createUser(values);
        message.success('创建成功');
      }
      setDrawerOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<User>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '用户名', dataIndex: 'username', ellipsis: true },
    { title: '角色', dataIndex: 'role_name', search: false, ellipsis: true },
    {
      title: intl.formatMessage({ id: 'common.createTime' }),
      dataIndex: 'created_at',
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
            permissionCode="user:list"
            type="link"
            size="small"
            onClick={() => openDetail(record)}
          >
            详情
          </AccessButton>
          <AccessButton
            permissionCode="user:update"
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
              permissionCode="user:delete"
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
      <ProTable<User>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getUserList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            username: params.username,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="user:create"
            type="primary"
            onClick={openCreate}
          >
            {intl.formatMessage({ id: 'common.create' })}
          </AccessButton>,
        ]}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 20 }}
      />
      <Drawer
        title={
          editRecord
            ? intl.formatMessage({ id: 'common.edit' })
            : intl.formatMessage({ id: 'common.create' })
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <AccessButton
              permissionCode={editRecord ? 'user:update' : 'user:create'}
              type="primary"
              loading={submitting}
              onClick={handleSubmit}
            >
              {intl.formatMessage({ id: 'common.save' })}
            </AccessButton>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {!editRecord && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role_id" label="角色">
            <Select placeholder="请选择角色" allowClear>
              {roleList.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.role_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
      <Drawer
        title="用户详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={400}
      >
        {detailRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detailRecord.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">
              {detailRecord.username}
            </Descriptions.Item>
            <Descriptions.Item label="角色ID">
              {detailRecord.roleId ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detailRecord.createdAt ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {detailRecord.updatedAt ?? '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
