import { setLocale, useIntl } from '@umijs/max';
import { Button } from 'antd';

export default function LangSwitch() {
  const intl = useIntl();
  const isZh = intl.locale === 'zh-CN';
  return (
    <Button
      type="text"
      size="small"
      onClick={() => setLocale(isZh ? 'en-US' : 'zh-CN', false)}
      style={{ color: 'rgba(0,0,0,0.65)' }}
    >
      {isZh ? 'EN' : '中文'}
    </Button>
  );
}
