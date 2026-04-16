import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
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
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import {
  createAccount,
  deleteAccount,
  getAccountList,
  updateAccount,
  type Account,
} from '../../../services/account';
import { getCompanySelectList, type Company } from '../../../services/company';
import { getAppSelectList } from '../../../services/dashboard';

const ACCOUNT_TYPE_MAP: Record<number, string> = {
  1: 'AppStore',
  2: 'Google Play',
  3: 'TikTok',
  4: 'ASA',
  5: 'Facebook',
};

export interface AccountInfoEntry {
  key: string;
  value: string;
}

export function objectToEntries(
  accountInfo?: Record<string, unknown>,
): AccountInfoEntry[] {
  if (!accountInfo || typeof accountInfo !== 'object') {
    return [{ key: '', value: '' }];
  }

  const entries = Object.entries(accountInfo).map(([key, value]) => ({
    key,
    value:
      typeof value === 'string'
        ? value
        : value === null || value === undefined
        ? ''
        : JSON.stringify(value),
  }));

  return entries.length > 0 ? entries : [{ key: '', value: '' }];
}

export function entriesToObject(
  entries?: AccountInfoEntry[],
): Record<string, string> | undefined {
  if (!entries?.length) {
    return undefined;
  }

  const normalizedEntries = entries.filter(
    (entry) => entry && (entry.key?.trim() || entry.value?.trim()),
  );

  if (normalizedEntries.length === 0) {
    return undefined;
  }

  const result: Record<string, string> = {};
  for (const entry of normalizedEntries) {
    const key = entry.key.trim();
    if (!key) {
      continue;
    }
    result[key] = entry.value ?? '';
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export default function AccountPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [appList, setAppList] = useState<
    { app_id: string; app_name: string }[]
  >([]);
  const accountInfoEntries = Form.useWatch('account_info_entries', form) as
    | AccountInfoEntry[]
    | undefined;

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
    form.setFieldsValue({ account_info_entries: [{ key: '', value: '' }] });
    setModalOpen(true);
  };

  const openEdit = (record: Account) => {
    setEditRecord(record);
    form.setFieldsValue({
      account_type: record.account_type,
      company_id: record.company_id,
      appid: record.app_id,
      account_info_entries: objectToEntries(record.account_info),
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
    const entries = (values.account_info_entries ?? []) as AccountInfoEntry[];
    const duplicateKeys = entries
      .map((entry) => entry.key?.trim())
      .filter(Boolean)
      .filter((key, index, list) => list.indexOf(key) !== index);

    if (duplicateKeys.length > 0) {
      message.error(`账号信息存在重复 Key：${duplicateKeys[0]}`);
      return;
    }

    const invalidEntry = entries.find(
      (entry) => !entry.key?.trim() && entry.value?.trim(),
    );
    if (invalidEntry) {
      message.error('请输入账号信息 Key');
      return;
    }

    const accountInfo = entriesToObject(entries);
    if (entries?.some((entry) => entry.key?.trim()) && !accountInfo) {
      message.error('账号信息生成失败');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        account_type: values.account_type,
        company_id: values.company_id,
        appid: values.app_id,
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
  const accountInfoPreview = JSON.stringify(
    entriesToObject(accountInfoEntries) ?? {},
    null,
    2,
  );

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
      render: (_, record) =>
        companyMap.get(record.company_id) ?? record.company_id,
    },
    {
      title: '关联应用',
      dataIndex: 'app_id',
      search: false,
      width: 320,
      ellipsis: true,
      render: (_, record) =>
        Array.isArray(record.app_id)
          ? record.app_id
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
            <Select
              placeholder="请选择公司"
              showSearch
              optionFilterProp="children"
            >
              {companyList.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.company_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="app_id"
            label="关联应用"
            rules={[{ required: true }]}
          >
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
          <Form.Item label="账号信息">
            <Form.List name="account_info_entries">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space
                      key={field.key}
                      align="start"
                      style={{ display: 'flex', marginBottom: 8 }}
                    >
                      <Form.Item
                        key={`account-info-key-${field.key}`}
                        name={[field.name, 'key']}
                        fieldKey={[field.fieldKey!, 'key']}
                        rules={[{ whitespace: true, message: '请输入 Key' }]}
                      >
                        <Input
                          placeholder="请输入 Key"
                          style={{ width: 160 }}
                        />
                      </Form.Item>
                      <Form.Item
                        key={`account-info-value-${field.key}`}
                        name={[field.name, 'value']}
                        fieldKey={[field.fieldKey!, 'value']}
                      >
                        <Input
                          placeholder="请输入 Value"
                          style={{ width: 220 }}
                        />
                      </Form.Item>
                      <Button
                        aria-label={`删除账号信息-${field.name}`}
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ key: '', value: '' })}
                    block
                    icon={<PlusOutlined />}
                  >
                    新增键值对
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label="JSON 预览">
            <Input.TextArea value={accountInfoPreview} rows={6} readOnly />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
