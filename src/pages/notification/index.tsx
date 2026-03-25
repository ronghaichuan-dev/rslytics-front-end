import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { useRef } from 'react';
import {
  getNotificationList,
  type Notification,
} from '../../services/notification';

export default function NotificationPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<Notification>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: '通知类型', dataIndex: 'notice_type', ellipsis: true },
    { title: '续订状态', dataIndex: 'renewal_status', ellipsis: true },
    { title: '用户ID', dataIndex: 'uuid', ellipsis: true },
    {
      title: intl.formatMessage({ id: 'common.createTime' }),
      dataIndex: 'created_at',
      search: false,
      width: 180,
    },
  ];

  return (
    <ProTable<Notification>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      request={async (params) => {
        const res = await getNotificationList({
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 20,
          noticeType: params.notice_type,
          renewalStatus: params.renewal_status,
          uuid: params.uuid,
        });
        return { data: res.list, total: res.total, success: true };
      }}
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 20 }}
      toolBarRender={false}
    />
  );
}
