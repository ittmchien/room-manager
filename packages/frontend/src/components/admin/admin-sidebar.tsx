'use client';

import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TagsOutlined,
  CreditCardOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GiftOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Sider } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/admin/tags', icon: <TagsOutlined />, label: 'Tags' },
  { key: '/admin/billing', icon: <CreditCardOutlined />, label: 'Billing' },
  { key: '/admin/campaigns', icon: <GiftOutlined />, label: 'Campaigns' },
  { key: '/admin/pricing', icon: <DollarOutlined />, label: 'Pricing' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: 'System Config' },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = menuItems
    .slice()
    .reverse()
    .find((item) => pathname === item.key || pathname.startsWith(item.key + '/'))?.key ?? '/admin';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={220}
      style={{ background: '#001529', minHeight: '100vh' }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? 0 : '0 16px',
          color: '#fff',
          fontSize: collapsed ? 20 : 16,
          fontWeight: 700,
          cursor: 'pointer',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {!collapsed && <span>Room Admin</span>}
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
