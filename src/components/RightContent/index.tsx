import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Dropdown, Space } from 'antd';
import { TOKEN_KEY } from '../../constants';
import { logout } from '../../services/auth';
import LangSwitch from '../LangSwitch';

export default function RightContent() {
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    await setInitialState({});
    history.push('/login');
  };

  const menuItems = [
    {
      key: 'username',
      label: initialState?.username ?? '用户',
      disabled: true,
      style: { color: '#000', cursor: 'default' },
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Dropdown menu={{ items: menuItems }} placement="topRight">
          <Space style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.65)' }}>
            <UserOutlined />
            <span style={{ fontSize: 14 }}>
              {initialState?.username ?? '用户'}
            </span>
          </Space>
        </Dropdown>
        <LangSwitch />
      </Space>
    </div>
  );
}
