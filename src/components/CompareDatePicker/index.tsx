import { DatePicker, Select, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const timezoneOptions = [
  { label: 'UTC-12 贝克岛', value: 'Etc/GMT+12' },
  { label: 'UTC-11 帕果帕果', value: 'Pacific/Pago_Pago' },
  { label: 'UTC-10 檀香山', value: 'Pacific/Honolulu' },
  { label: 'UTC-9 安克雷奇', value: 'America/Anchorage' },
  { label: 'UTC-8 洛杉矶', value: 'America/Los_Angeles' },
  { label: 'UTC-7 丹佛', value: 'America/Denver' },
  { label: 'UTC-6 芝加哥', value: 'America/Chicago' },
  { label: 'UTC-5 纽约', value: 'America/New_York' },
  { label: 'UTC-4 圣地亚哥', value: 'America/Santiago' },
  { label: 'UTC-3 圣保罗', value: 'America/Sao_Paulo' },
  { label: 'UTC+0 伦敦', value: 'Europe/London' },
  { label: 'UTC+1 柏林', value: 'Europe/Berlin' },
  { label: 'UTC+2 开罗', value: 'Africa/Cairo' },
  { label: 'UTC+3 莫斯科', value: 'Europe/Moscow' },
  { label: 'UTC+4 迪拜', value: 'Asia/Dubai' },
  { label: 'UTC+5 卡拉奇', value: 'Asia/Karachi' },
  { label: 'UTC+5:30 孟买', value: 'Asia/Kolkata' },
  { label: 'UTC+6 达卡', value: 'Asia/Dhaka' },
  { label: 'UTC+7 曼谷', value: 'Asia/Bangkok' },
  { label: 'UTC+8 上海', value: 'Asia/Shanghai' },
  { label: 'UTC+9 东京', value: 'Asia/Tokyo' },
  { label: 'UTC+10 悉尼', value: 'Australia/Sydney' },
  { label: 'UTC+12 奥克兰', value: 'Pacific/Auckland' },
];

interface CompareDatePickerProps {
  value: DateRange;
  compareValue?: DateRange;
  onChange: (range: DateRange) => void;
  onCompareChange: (range: DateRange | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  timezone?: string;
  onTimezoneChange?: (tz: string) => void;
}

const CompareDatePicker: React.FC<CompareDatePickerProps> = ({
  value,
  compareValue,
  onChange,
  onCompareChange,
  size,
  timezone,
  onTimezoneChange,
}) => {
  const handleMainChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        onChange({
          startDate: dates[0].format('YYYY-MM-DD'),
          endDate: dates[1].format('YYYY-MM-DD'),
        });
      }
    },
    [onChange],
  );

  const handleCompareChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates || !dates[0] || !dates[1]) {
        onCompareChange(undefined);
        return;
      }
      onCompareChange({
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    },
    [onCompareChange],
  );

  const handleQuickCompare = useCallback(
    (type: string) => {
      const start = dayjs(value.startDate);
      const end = dayjs(value.endDate);
      const diff = end.diff(start, 'day') + 1;
      let compareStart: Dayjs;
      let compareEnd: Dayjs;
      switch (type) {
        case 'prev':
          compareStart = start.subtract(diff, 'day');
          compareEnd = start.subtract(1, 'day');
          break;
        case 'yoy':
          compareStart = start.subtract(1, 'year');
          compareEnd = end.subtract(1, 'year');
          break;
        case 'lastMonth':
          compareStart = start.subtract(1, 'month');
          compareEnd = end.subtract(1, 'month');
          break;
        default:
          return;
      }
      onCompareChange({
        startDate: compareStart.format('YYYY-MM-DD'),
        endDate: compareEnd.format('YYYY-MM-DD'),
      });
    },
    [value, onCompareChange],
  );

  return (
    <Space>
      <RangePicker
        size={size}
        value={[dayjs(value.startDate), dayjs(value.endDate)]}
        onChange={handleMainChange as any}
        allowClear={false}
      />
      <Text type="secondary">VS</Text>
      <Select
        size={size}
        placeholder="快捷对比"
        style={{ width: 110 }}
        onChange={handleQuickCompare}
        value={undefined}
        options={[
          { label: '上一周期', value: 'prev' },
          { label: '去年同期', value: 'yoy' },
          { label: '上月同期', value: 'lastMonth' },
        ]}
      />
      <RangePicker
        size={size}
        value={
          compareValue
            ? [dayjs(compareValue.startDate), dayjs(compareValue.endDate)]
            : undefined
        }
        onChange={handleCompareChange as any}
        placeholder={['对比开始', '对比结束']}
        allowClear
      />
      {onTimezoneChange && (
        <Select
          size={size}
          style={{ width: 180 }}
          value={timezone || 'Asia/Shanghai'}
          onChange={onTimezoneChange}
          options={timezoneOptions}
          showSearch
          optionFilterProp="label"
        />
      )}
    </Space>
  );
};

export default CompareDatePicker;
