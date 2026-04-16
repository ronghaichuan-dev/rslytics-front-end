import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Statistic, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  current: number;
  compare?: number;
  changeRate?: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  current,
  compare,
  changeRate,
  prefix,
  suffix,
  precision = 0,
  loading = false,
}) => {
  const hasCompare = compare !== undefined && compare !== null;
  const isUp = (changeRate ?? 0) > 0;
  const isDown = (changeRate ?? 0) < 0;

  return (
    <Card size="small" loading={loading}>
      <Statistic
        title={title}
        value={current}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
      />
      {hasCompare && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
          <Text type="secondary">
            对比: {precision > 0 ? compare?.toFixed(precision) : compare}
          </Text>
          {changeRate !== undefined && (
            <span
              style={{
                marginLeft: 8,
                color: isUp ? '#52c41a' : isDown ? '#f5222d' : '#666',
              }}
            >
              {isUp && <ArrowUpOutlined />}
              {isDown && <ArrowDownOutlined />}
              {Math.abs(changeRate).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default KpiCard;
