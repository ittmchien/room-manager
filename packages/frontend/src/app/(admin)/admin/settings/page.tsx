'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Button, Typography, Space, Spin, message, Descriptions, Switch } from 'antd';
import { apiFetch } from '@/lib/api';

const { Title, Text } = Typography;

interface SystemConfig {
  key: string;
  value: string;
  type: string;
  description: string | null;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<SystemConfig[]>('/admin/config');
      setConfigs(data);
      const initial: Record<string, string> = {};
      data.forEach((c) => { initial[c.key] = c.value; });
      form.setFieldsValue(initial);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const onFinish = async (values: Record<string, string>) => {
    setSaving(true);
    try {
      const payload = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await apiFetch('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify({ configs: payload }),
      });
      message.success('Đã lưu cấu hình');
      fetchConfigs();
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (config: SystemConfig) => {
    if (config.type === 'BOOLEAN') {
      return (
        <Form.Item name={config.key} valuePropName="checked" getValueFromEvent={(checked: boolean) => String(checked)}>
          <Switch />
        </Form.Item>
      );
    }
    return (
      <Form.Item name={config.key} rules={[{ required: true }]}>
        <Input style={{ maxWidth: 300 }} />
      </Form.Item>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Cấu hình hệ thống</Title>

      <Card>
        <Form form={form} onFinish={onFinish}>
          {configs.map((config) => (
            <Card
              key={config.key}
              size="small"
              style={{ marginBottom: 12 }}
              title={
                <Space>
                  <Text code>{config.key}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>({config.type})</Text>
                </Space>
              }
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cập nhật: {new Date(config.updatedAt).toLocaleString('vi-VN')}
                </Text>
              }
            >
              {config.description && (
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {config.description}
                </Text>
              )}
              {renderInput(config)}
            </Card>
          ))}

          <Button type="primary" htmlType="submit" loading={saving} style={{ marginTop: 8 }}>
            Lưu tất cả
          </Button>
        </Form>
      </Card>
    </div>
  );
}
