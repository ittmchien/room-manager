'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

type TierType = 'SINGLE' | 'SLOT' | 'BUNDLE';

interface PricingTier {
  id: string;
  featureKey: string;
  tierType: TierType;
  tierName: string;
  price: number;
  discountPercent: number;
  includedFeatures: string[] | null;
  slotSize: number | null;
  isActive: boolean;
}

const tierTypeColors: Record<TierType, string> = {
  SINGLE: 'blue',
  SLOT: 'orange',
  BUNDLE: 'purple',
};

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + 'đ';
}

export default function AdminPricingPage() {
  const [data, setData] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PricingTier | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<PricingTier[]>('/admin/pricing');
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, tierType: 'SINGLE', discountPercent: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: PricingTier) => {
    setEditing(record);
    form.setFieldsValue({
      featureKey: record.featureKey,
      tierType: record.tierType,
      tierName: record.tierName,
      price: record.price,
      discountPercent: record.discountPercent,
      includedFeatures: record.includedFeatures?.join(', ') ?? '',
      slotSize: record.slotSize,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        featureKey: values.featureKey,
        tierType: values.tierType,
        tierName: values.tierName,
        price: values.price,
        discountPercent: values.discountPercent ?? 0,
        includedFeatures: values.includedFeatures
          ? values.includedFeatures.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        slotSize: values.slotSize || null,
        isActive: values.isActive,
      };

      if (editing) {
        await apiFetch(`/admin/pricing/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        message.success('Cập nhật thành công');
      } else {
        await apiFetch('/admin/pricing', { method: 'POST', body: JSON.stringify(payload) });
        message.success('Tạo pricing tier thành công');
      }
      setModalOpen(false);
      fetchTiers();
    } catch {
      message.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/admin/pricing/${id}`, { method: 'DELETE' });
      message.success('Đã xóa');
      fetchTiers();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleToggle = async (record: PricingTier) => {
    try {
      await apiFetch(`/admin/pricing/${record.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !record.isActive }),
      });
      fetchTiers();
    } catch {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns: ColumnsType<PricingTier> = [
    {
      title: 'Feature Key',
      dataIndex: 'featureKey',
      key: 'featureKey',
      render: (v) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{v}</code>,
    },
    {
      title: 'Tên gói',
      dataIndex: 'tierName',
      key: 'tierName',
      render: (name, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Tag color={tierTypeColors[r.tierType]} style={{ marginTop: 2 }}>{r.tierType}</Tag>
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatPrice(r.price)}</div>
          {r.discountPercent > 0 && (
            <Tag color="green" style={{ marginTop: 2 }}>-{r.discountPercent}%</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Slot',
      dataIndex: 'slotSize',
      key: 'slotSize',
      render: (v) => v ?? '-',
    },
    {
      title: 'Tính năng đi kèm',
      dataIndex: 'includedFeatures',
      key: 'includedFeatures',
      render: (features: string[] | null) =>
        features?.length ? (
          <Space wrap>
            {features.map((f) => <Tag key={f}>{f}</Tag>)}
          </Space>
        ) : '-',
    },
    {
      title: 'Kích hoạt',
      key: 'isActive',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggle(record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa gói này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Pricing</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm gói</Button>
      </div>

      <Card>
        <Table
          rowKey="id"
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editing ? 'Chỉnh sửa gói' : 'Thêm gói mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        width={580}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="featureKey" label="Feature Key" rules={[{ required: true }]}>
            <Input placeholder="e.g. premium_report, slot_rooms" />
          </Form.Item>
          <Form.Item name="tierName" label="Tên gói" rules={[{ required: true }]}>
            <Input placeholder="e.g. Gói Cơ bản, Gói 5 phòng" />
          </Form.Item>
          <Form.Item name="tierType" label="Loại" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'SINGLE', label: 'SINGLE — Mua lẻ' },
                { value: 'SLOT', label: 'SLOT — Theo số lượng slot' },
                { value: 'BUNDLE', label: 'BUNDLE — Gói combo' },
              ]}
            />
          </Form.Item>
          <Form.Item name="price" label="Giá (VND)" rules={[{ required: true }]}>
            <InputNumber min={0} step={1000} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="discountPercent" label="Giảm giá (%)">
            <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="slotSize" label="Số slot (nếu loại SLOT)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="includedFeatures" label="Tính năng đi kèm (cách nhau dấu phẩy)">
            <Input placeholder="e.g. qr_code, export_pdf" />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
