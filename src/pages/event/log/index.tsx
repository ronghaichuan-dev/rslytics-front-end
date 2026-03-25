import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Descriptions, Drawer } from 'antd';
import { useRef, useState } from 'react';
import {
  getAppEventLogDetail,
  getAppEventLogList,
  type AppEventLog,
  type AppEventLogDetail,
} from '../../../services/appEventLog';

export default function EventLogPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<AppEventLogDetail | null>(null);

  const openDetail = async (record: AppEventLog) => {
    try {
      const res = await getAppEventLogDetail(record.id);
      setDetail(res);
      setDrawerOpen(true);
    } catch {}
  };

  const columns: ProColumns<AppEventLog>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: 'AppID', dataIndex: 'appid', ellipsis: true },
    { title: '事件码', dataIndex: 'event_code', search: false, ellipsis: true },
    { title: '用户ID', dataIndex: 'user_id', ellipsis: true },
    {
      title: intl.formatMessage({ id: 'common.createTime' }),
      dataIndex: 'created_at',
      search: false,
      width: 180,
    },
  ];

  return (
    <>
      <ProTable<AppEventLog>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        onRow={(record) => ({
          onClick: () => openDetail(record),
          style: { cursor: 'pointer' },
        })}
        request={async (params) => {
          const res = await getAppEventLogList({
            page: params.current ?? 1,
            size: params.pageSize ?? 20,
            appid: params.appid,
            user_id: params.user_id,
          });
          return { data: res.list, total: res.total, success: true };
        }}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 20 }}
      />
      <Drawer
        title="事件日志详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="AppID">{detail.appid}</Descriptions.Item>
            <Descriptions.Item label="事件码">
              {detail.event_code}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {detail.user_id}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detail.created_at}
            </Descriptions.Item>
            {detail.event_data && (
              <Descriptions.Item label="事件数据">
                <pre style={{ fontSize: 12, margin: 0 }}>
                  {JSON.stringify(detail.event_data, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
