'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Select, Button, Tag, Space, Typography, Card } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface UserItem {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  tags: string[];
  createdAt: string;
}

interface ListUsersResponse {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'orange',
  USER: 'blue',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    try {
      const res = await apiFetch<ListUsersResponse>(`/admin/users?${params}`);
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const columns: ColumnsType<UserItem> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Button type="link" icon={<UserOutlined />} onClick={() => router.push(`/admin/users/${record.id}`)}>
          {name || '(chưa đặt tên)'}
        </Button>
      ),
    },
    {
      title: 'Email / Phone',
      key: 'contact',
      render: (_, record) => record.email || record.phone || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={roleColors[role] ?? 'default'}>{role}</Tag>,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => new Date(d).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Quản lý Users</Title>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm theo tên / email / phone"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo role"
            allowClear
            style={{ width: 160 }}
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v); setPage(1); }}
            options={[
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'User' },
            ]}
          />
        </Space>
        <Table
          rowKey="id"
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: setPage,
            showTotal: (t) => `${t} users`,
          }}
        />
      </Card>
    </div>
  );
}
