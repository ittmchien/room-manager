'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Table, Tag, Typography, Card, Button, Form, Select, Input, DatePicker, Space, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import { FEATURE_KEYS } from '@room-manager/shared';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';

const { Title } = Typography;
const FormItem = Form.Item;

interface Subscription {
  id: string;
  user: { name: string; email: string | null };
  plan: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
}

interface UserFeature {
  id: string;
  user: { name: string; email: string | null };
  featureKey: string;
  expiresAt: string | null;
  createdAt: string;
}

const featureOptions = Object.values(FEATURE_KEYS).map((k) => ({ value: k, label: k }));

function SubscriptionsTab() {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: Subscription[] }>('/admin/billing/subscriptions');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const columns: ColumnsType<Subscription> = [
    {
      title: 'User',
      key: 'user',
      render: (_, r) => r.user.name || r.user.email || '-',
    },
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
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => new Date(d).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <Table rowKey="id" dataSource={data} columns={columns} loading={loading} />
  );
}

function FeaturesTab() {
  const [data, setData] = useState<UserFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: UserFeature[] }>('/admin/billing/features');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const grant = async (values: { userId: string; featureKey: string; expiresAt?: import('dayjs').Dayjs }) => {
    await apiFetch('/admin/billing/features/grant', {
      method: 'POST',
      body: JSON.stringify({
        userIds: [values.userId],
        featureKeys: [values.featureKey],
        expiresAt: values.expiresAt?.toISOString(),
      }),
    });
    message.success('Đã cấp feature');
    form.resetFields();
    fetch();
  };

  const revoke = async (userId: string, featureKey: string) => {
    await apiFetch('/admin/billing/features/revoke', {
      method: 'POST',
      body: JSON.stringify({ userId, featureKey }),
    });
    message.success('Đã thu hồi');
    fetch();
  };

  const columns: ColumnsType<UserFeature> = [
    {
      title: 'User',
      key: 'user',
      render: (_, r) => r.user.name || r.user.email || '-',
    },
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
      render: (_, r) => (
        <Popconfirm title="Thu hồi feature?" onConfirm={() => revoke(r.user as unknown as string, r.featureKey)}>
          <Button danger size="small">Thu hồi</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Card title="Cấp feature thủ công" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={grant}>
          <FormItem name="userId" rules={[{ required: true, message: 'Nhập User ID' }]}>
            <Input placeholder="User ID" style={{ width: 280 }} />
          </FormItem>
          <FormItem name="featureKey" rules={[{ required: true }]}>
            <Select placeholder="Feature" options={featureOptions} style={{ width: 200 }} />
          </FormItem>
          <FormItem name="expiresAt">
            <DatePicker placeholder="Hết hạn (tùy chọn)" />
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Cấp
            </Button>
          </FormItem>
        </Form>
      </Card>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} />
    </>
  );
}

export default function AdminBillingPage() {
  const tabs: TabsProps['items'] = [
    { key: 'subscriptions', label: 'Subscriptions', children: <SubscriptionsTab /> },
    { key: 'features', label: 'Feature Grants', children: <FeaturesTab /> },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Billing & Features</Title>
      <Card>
        <Tabs defaultActiveKey="subscriptions" items={tabs} />
      </Card>
    </div>
  );
}
