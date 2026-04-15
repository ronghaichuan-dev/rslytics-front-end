import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Form, Input, message, Modal, Popconfirm, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import {
  createAccount,
  deleteAccount,
  getAccountList,
  updateAccount,
  type Account,
} from '../../../services/account';
import {
  getCompanySelectList,
  type Company,
} from '../../../services/company';
import { getAppSelectList } from '../../../services/dashboard';

const ACCOUNT_TYPE_MAP: Record<number, string> = {
  1: 'AppStore',
  2: 'Google Play',
  3: 'TikTok',
  4: 'ASA',
  5: 'Facebook',
};

export default function AccountPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [appList, setAppList] = useState<{ app_id: string; app_name: string }[]>([]);

  useEffect(() => {
    getCompanySelectList()
      .then((res) => setCompanyList(res.list ?? []))
      .catch(() => {});
    getAppSelectList()
      .then((res) => setAppList(res.list ?? []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Account) => {
    setEditRecord(record);
    form.setFieldsValue({
      account_type: record.account_type,
      company_id: record.company_id,
      appid: record.appid,
      account_info: record.account_info
        ? JSON.stringify(record.account_info, null, 2)
        : '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    let accountInfo: Record<string, unknown> | undefined;
    if (values.account_info) {
      try {
        accountInfo = JSON.parse(values.account_info);
      } catch {
        message.error('账号信息必须为合法 JSON');
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = {
        account_type: values.account_type,
        company_id: values.company_id,
        appid: values.appid,
        account_info: accountInfo,
      };
      if (editRecord) {
        await updateAccount({ id: editRecord.id, ...payload });
        message.success('更新成功');
      } else {
        await createAccount(payload as Parameters<typeof createAccount>[0]);
        message.success('创建成功');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const companyMap = new Map(companyList.map((c) => [c.id, c.company_name]));
  const appMap = new Map(appList.map((app) => [app.app_id, app.app_name]));

  const columns: ProColumns<Account>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    {
      title: '账号类型',
      dataIndex: 'account_type',
      width: 120,
      valueEnum: Object.fromEntries(
        Object.entries(ACCOUNT_TYPE_MAP).map(([k, v]) => [k, { text: v }]),
      ),
      render: (_, record) => ACCOUNT_TYPE_MAP[record.account_type] ?? '-',
    },
    {
      title: '关联公司',
      dataIndex: 'company_id',
      search: false,
      width: 180,
      render: (_, record) => companyMap.get(record.company_id) ?? record.company_id,
    },
    {
      title: '关联应用',
      dataIndex: 'appid',
      search: false,
      width: 320,
      ellipsis: true,
      render: (_, record) =>
        Array.isArray(record.appid)
          ? record.appid
              .map((appId) => {
                const appName = appMap.get(appId);
                return appName ? `${appName} (${appId})` : appId;
              })
              .join(', ')
          : '-',
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
            permissionCode="account:update"
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
              permissionCode="account:delete"
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
      <ProTable<Account>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getAccountList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            account_type: params.account_type
              ? Number(params.account_type)
              : undefined,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="account:create"
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
            name="account_type"
            label="账号类型"
            rules={[{ required: true }]}
          >
            <Select placeholder="请选择账号类型">
              {Object.entries(ACCOUNT_TYPE_MAP).map(([k, v]) => (
                <Select.Option key={k} value={Number(k)}>
                  {v}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="company_id"
            label="关联公司"
            rules={[{ required: true }]}
          >
            <Select placeholder="请选择公司" showSearch optionFilterProp="children">
              {companyList.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.company_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="appid" label="关联应用" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="请选择应用"
              showSearch
              optionFilterProp="children"
            >
              {appList.map((a) => (
                <Select.Option key={a.app_id} value={a.app_id}>
                  {a.app_id} - {a.app_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="account_info" label="账号信息">
            <Input.TextArea rows={4} placeholder='JSON 格式，如 {"key": "value"}' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
