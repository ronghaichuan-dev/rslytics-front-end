import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Descriptions, Drawer } from 'antd';
import { useRef, useState } from 'react';
import {
  getAppEventLogDetail,
  getAppEventLogList,
  type AppEventLog,
} from '../../../services/appEventLog';

export default function EventLogPage() {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<AppEventLog | null>(null);

  const openDetail = async (record: AppEventLog) => {
    try {
      const res = await getAppEventLogDetail(record.id);
      setDetail(res.event_log);
      setDrawerOpen(true);
    } catch {}
  };

  const columns: ProColumns<AppEventLog>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, search: false },
    { title: 'AppID', dataIndex: 'appid', ellipsis: true },
    { title: '事件码', dataIndex: 'eventCode', search: false, ellipsis: true },
    { title: '用户ID', dataIndex: 'userId', ellipsis: true },
    {
      title: intl.formatMessage({ id: 'common.createTime' }),
      dataIndex: 'createdAt',
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
            user_id: params.userId,
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
              {detail.eventCode}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {detail.userId}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detail.createdAt}
            </Descriptions.Item>
            {detail.responseText && (
              <Descriptions.Item label="响应数据">
                <pre style={{ fontSize: 12, margin: 0 }}>
                  {detail.responseText}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
