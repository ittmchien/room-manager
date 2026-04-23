'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { createBrowserClient } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';
import type { AuthUser } from '@room-manager/shared';

const { Title } = Typography;
const FormItem = Form.Item;
const InputPassword = Input.Password;

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (authError) {
      setError('Email hoặc mật khẩu không đúng');
      setLoading(false);
      return;
    }

    try {
      const me = await apiFetch<AuthUser>('/auth/me');
      if (me.role !== 'SUPER_ADMIN' && me.role !== 'ADMIN') {
        await supabase.auth.signOut();
        setError('Bạn không có quyền truy cập trang admin');
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch {
      setError('Không thể xác thực quyền truy cập');
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          Room Manager Admin
        </Title>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <FormItem
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="admin@example.com" size="large" />
        </FormItem>

        <FormItem
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Nhập mật khẩu' }]}
        >
          <InputPassword prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </FormItem>

        <FormItem style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Đăng nhập
          </Button>
        </FormItem>
      </Form>
    </Card>
  );
}
