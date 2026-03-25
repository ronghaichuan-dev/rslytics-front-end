import { history } from '@umijs/max';
import { Button, Card, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { TOKEN_KEY } from '../../constants';
import { getCaptcha, login } from '../../services/auth';

interface CaptchaState {
  id: string;
  base64: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null);

  const fetchCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptcha(data);
    } catch {
      // captcha optional
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (values: {
    username: string;
    password: string;
    captcha?: string;
  }) => {
    setLoading(true);
    try {
      const res = await login({
        username: values.username,
        password: values.password,
        captcha: values.captcha,
        captcha_id: captcha?.id,
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      message.success('登录成功');
      history.push('/dashboard');
    } catch {
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card title="归因数据管理系统" style={{ width: 380 }}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          {captcha && (
            <Form.Item name="captcha" label="验证码">
              <div style={{ display: 'flex', gap: 8 }}>
                <Input placeholder="请输入验证码" style={{ flex: 1 }} />
                <img
                  src={captcha.base64}
                  alt="验证码"
                  style={{ height: 32, cursor: 'pointer' }}
                  onClick={fetchCaptcha}
                />
              </div>
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
