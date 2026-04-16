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
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Space size={16} align="center">
      <LangSwitch />
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <UserOutlined />
          <span>{initialState?.username ?? '用户'}</span>
        </Space>
      </Dropdown>
    </Space>
  );
}
