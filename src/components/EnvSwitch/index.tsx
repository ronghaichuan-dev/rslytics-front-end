import { SwapOutlined } from '@ant-design/icons';
import { Tag, Dropdown } from 'antd';
import { useState } from 'react';
import { ENV_CONFIG, ENV_KEY, EnvType, getCurrentEnv } from '../../constants';

const ENV_COLORS: Record<EnvType, string> = {
  local: 'blue',
  test: 'orange',
  prod: 'red',
};

export default function EnvSwitch() {
  const [env, setEnv] = useState<EnvType>(getCurrentEnv);

  const handleSwitch = (key: string) => {
    const newEnv = key as EnvType;
    localStorage.setItem(ENV_KEY, newEnv);
    setEnv(newEnv);
    window.location.reload();
  };

  const menuItems = Object.entries(ENV_CONFIG).map(([key, { label }]) => ({
    key,
    label: (
      <span>
        <Tag color={ENV_COLORS[key as EnvType]} style={{ marginRight: 8 }}>
          {label}
        </Tag>
        {key === env && '✓'}
      </span>
    ),
    onClick: () => handleSwitch(key),
  }));

  return (
    <Dropdown menu={{ items: menuItems }} placement="topRight">
      <Tag
        color={ENV_COLORS[env]}
        style={{ cursor: 'pointer', fontSize: 12 }}
        icon={<SwapOutlined />}
      >
        {ENV_CONFIG[env].label}环境
      </Tag>
    </Dropdown>
  );
}
