'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import {
  Card, Descriptions, Tag, Select, Button, Space, Typography, Divider,
  Table, Popconfirm, Input, Form, DatePicker, message,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { FEATURE_KEYS } from '@room-manager/shared';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

interface UserDetail {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  tags: string[];
  createdAt: string;
  properties: { id: string; name: string }[];
  userFeatures: { featureKey: string; expiresAt: string | null }[];
  subscriptions: { plan: string; status: string; expiresAt: string | null }[];
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'orange',
  USER: 'blue',
};

const featureOptions = Object.values(FEATURE_KEYS).map((k) => ({ value: k, label: k }));

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [role, setRole] = useState('USER');
  const [tagInput, setTagInput] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    try {
      const u = await apiFetch<UserDetail>(`/admin/users/${id}`);
      setUser(u);
      setRole(u.role);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const saveRole = async () => {
    setSavingRole(true);
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      message.success('Đã cập nhật role');
      fetchUser();
    } finally {
      setSavingRole(false);
    }
  };

  const addTag = async () => {
    if (!tagInput.trim()) return;
    const newTags = [...(user?.tags ?? []), tagInput.trim()];
    await apiFetch(`/admin/users/${id}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags: newTags }),
    });
    message.success('Đã thêm tag');
    setTagInput('');
    fetchUser();
  };

  const removeTag = async (tag: string) => {
    await apiFetch(`/admin/users/${id}/tags/${tag}`, { method: 'DELETE' });
    message.success('Đã xóa tag');
    fetchUser();
  };

  const grantFeature = async (values: { featureKey: string; expiresAt?: dayjs.Dayjs }) => {
    await apiFetch('/admin/billing/features/grant', {
      method: 'POST',
      body: JSON.stringify({
        userIds: [id],
        featureKeys: [values.featureKey],
        expiresAt: values.expiresAt?.toISOString(),
      }),
    });
    message.success('Đã cấp feature');
    fetchUser();
  };

  const revokeFeature = async (featureKey: string) => {
    await apiFetch('/admin/billing/features/revoke', {
      method: 'POST',
      body: JSON.stringify({ userId: id, featureKey }),
    });
    message.success('Đã thu hồi feature');
    fetchUser();
  };

  const featureColumns: ColumnsType<{ featureKey: string; expiresAt: string | null }> = [
    { title: 'Feature', dataIndex: 'featureKey', key: 'featureKey' },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : 'Vĩnh viễn'),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="Thu hồi feature này?" onConfirm={() => revokeFeature(record.featureKey)}>
          <Button danger size="small">Thu hồi</Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading || !user) return <Card loading />;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      <Title level={4}>{user.name || '(chưa đặt tên)'}</Title>

      <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phone ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Properties">
            {user.properties.length}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Space align="start" wrap>
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Role</div>
            <Space>
              <Select
                value={role}
                onChange={setRole}
                options={[
                  { value: 'SUPER_ADMIN', label: 'Super Admin' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'USER', label: 'User' },
                ]}
                style={{ width: 160 }}
              />
              <Button type="primary" onClick={saveRole} loading={savingRole}>
                Lưu
              </Button>
            </Space>
          </div>

          <div style={{ minWidth: 280 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Tags</div>
            <Space wrap>
              {user.tags.map((t) => (
                <Tag
                  key={t}
                  closable
                  onClose={() => removeTag(t)}
                  color={roleColors[t] ?? 'geekblue'}
                >
                  {t}
                </Tag>
              ))}
              <Input.Search
                placeholder="Thêm tag..."
                enterButton={<PlusOutlined />}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onSearch={addTag}
                style={{ width: 180 }}
              />
            </Space>
          </div>
        </Space>
      </Card>

      <Card title="Features được cấp" style={{ marginBottom: 16 }}>
        <Form layout="inline" onFinish={grantFeature} style={{ marginBottom: 16 }}>
          <Form.Item name="featureKey" rules={[{ required: true }]}>
            <Select placeholder="Chọn feature" options={featureOptions} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="expiresAt">
            <DatePicker placeholder="Hết hạn (tùy chọn)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Cấp feature
            </Button>
          </Form.Item>
        </Form>
        <Table
          rowKey="featureKey"
          dataSource={user.userFeatures}
          columns={featureColumns}
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="Subscriptions">
        <Table
          rowKey={(r) => r.plan + r.status}
          dataSource={user.subscriptions}
          columns={[
            { title: 'Plan', dataIndex: 'plan', key: 'plan' },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (s) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag>,
            },
            {
              title: 'Hết hạn',
              dataIndex: 'expiresAt',
              key: 'expiresAt',
              render: (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-'),
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
