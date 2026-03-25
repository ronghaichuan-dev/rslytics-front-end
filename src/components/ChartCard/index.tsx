import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';

interface ChartCardProps {
  title: string;
  option: object;
  height?: number;
  loading?: boolean;
}

export default function ChartCard({
  title,
  option,
  height = 300,
  loading,
}: ChartCardProps) {
  return (
    <Card title={title} style={{ marginBottom: 16 }}>
      <ReactECharts
        option={option}
        style={{ height }}
        showLoading={loading}
        notMerge
      />
    </Card>
  );
}
