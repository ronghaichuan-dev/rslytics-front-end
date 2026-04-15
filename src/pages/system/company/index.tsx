import { UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Form, Image, Input, InputNumber, message, Modal, Popconfirm, Upload } from 'antd';
import { useRef, useState } from 'react';
import AccessButton from '../../../components/AccessButton';
import { getBackendAssetUrl } from '../../../constants/api';
import { uploadFile } from '../../../services/app';
import {
  createCompany,
  deleteCompany,
  getCompanyList,
  updateCompany,
  type Company,
} from '../../../services/company';

export default function CompanyPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [licenseUrl, setLicenseUrl] = useState<string>('');

  const openCreate = () => {
    setEditRecord(null);
    setLicenseUrl('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Company) => {
    setEditRecord(record);
    setLicenseUrl(record.business_license ?? '');
    form.setFieldsValue({
      company_name: record.company_name,
      unified_credit_code: record.unified_credit_code,
      tax_rate: record.tax_rate,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCompany(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch {}
  };

  const handleUpload = async (file: File): Promise<boolean> => {
    try {
      const res = await uploadFile(file);
      const url = getBackendAssetUrl(res.url);
      setLicenseUrl(url);
      form.setFieldValue('business_license', url);
      message.success('上传成功');
    } catch {}
    return false;
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await updateCompany({
          id: editRecord.id,
          ...values,
          business_license: licenseUrl || undefined,
        });
        message.success('更新成功');
      } else {
        await createCompany({
          ...values,
          business_license: licenseUrl || undefined,
        });
        message.success('创建成功');
      }
      setModalOpen(false);
      actionRef.current?.reload();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<Company>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '组织名称', dataIndex: 'company_name', ellipsis: true },
    {
      title: '统一信用编码',
      dataIndex: 'unified_credit_code',
      ellipsis: true,
      search: false,
    },
    {
      title: '税率',
      dataIndex: 'tax_rate',
      search: false,
      width: 100,
      render: (_, record) =>
        record.tax_rate !== undefined && record.tax_rate !== null
          ? `${record.tax_rate}%`
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
            permissionCode="company:update"
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
              permissionCode="company:delete"
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
      <ProTable<Company>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getCompanyList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            company_name: params.company_name,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        toolBarRender={() => [
          <AccessButton
            key="create"
            permissionCode="company:create"
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
            name="company_name"
            label="组织名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="营业执照">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {licenseUrl && (
                <Image
                  src={licenseUrl}
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
                  permissionCode={
                    editRecord ? 'company:update' : 'company:create'
                  }
                  icon={<UploadOutlined />}
                >
                  {licenseUrl ? '更换图片' : '上传图片'}
                </AccessButton>
              </Upload>
            </div>
          </Form.Item>
          <Form.Item name="unified_credit_code" label="统一信用编码">
            <Input />
          </Form.Item>
          <Form.Item name="tax_rate" label="税率">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={4}
              addonAfter="%"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
