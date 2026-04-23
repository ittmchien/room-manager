'use client';

import { Layout } from 'antd';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';

const { Header, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Layout style={{ height: '100dvh', overflow: 'hidden' }}>
      <AdminSidebar />
      <Layout style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #f0f0f0',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#666' }}>{user.name || user.email}</span>
          <Button icon={<LogoutOutlined />} onClick={signOut} type="text">
            Đăng xuất
          </Button>
        </Header>
        <Content style={{ margin: 24, overflow: 'auto' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
