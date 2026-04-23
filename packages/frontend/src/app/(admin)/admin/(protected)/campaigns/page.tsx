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
  DatePicker,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

type CampaignType = 'DISCOUNT' | 'FREE_TRIAL' | 'EXTEND_SUBSCRIPTION';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: CampaignType;
  rules: any;
  reward: any;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxRedemptions: number | null;
  createdAt: string;
  _count: { redemptions: number };
}

interface ListResponse {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
}

const typeColors: Record<CampaignType, string> = {
  DISCOUNT: 'green',
  FREE_TRIAL: 'blue',
  EXTEND_SUBSCRIPTION: 'purple',
};

const typeLabels: Record<CampaignType, string> = {
  DISCOUNT: 'Giảm giá',
  FREE_TRIAL: 'Dùng thử',
  EXTEND_SUBSCRIPTION: 'Gia hạn',
};

export default function AdminCampaignsPage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResponse>(`/admin/campaigns?page=${page}&limit=20`);
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, type: 'DISCOUNT' });
    setModalOpen(true);
  };

  const openEdit = (record: Campaign) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      type: record.type,
      isActive: record.isActive,
      maxRedemptions: record.maxRedemptions,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      targetTags: record.rules?.targetTags?.join(', ') ?? '',
      rewardType: record.reward?.type ?? record.type,
      discountPercent: record.reward?.discountPercent,
      featureKey: record.reward?.featureKey,
      trialDays: record.reward?.trialDays,
      days: record.reward?.days,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const [startDate, endDate] = values.dateRange;
      const payload = {
        name: values.name,
        description: values.description,
        type: values.type,
        isActive: values.isActive,
        maxRedemptions: values.maxRedemptions || null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rules: {
          targetTags: values.targetTags
            ? values.targetTags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [],
        },
        reward: {
          type: values.type,
          ...(values.type === 'DISCOUNT' && { discountPercent: values.discountPercent }),
          ...(values.type === 'FREE_TRIAL' && {
            featureKey: values.featureKey,
            trialDays: values.trialDays,
          }),
          ...(values.type === 'EXTEND_SUBSCRIPTION' && { days: values.days }),
        },
      };

      if (editing) {
        await apiFetch(`/admin/campaigns/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        message.success('Cập nhật campaign thành công');
      } else {
        await apiFetch('/admin/campaigns', { method: 'POST', body: JSON.stringify(payload) });
        message.success('Tạo campaign thành công');
      }
      setModalOpen(false);
      fetchCampaigns();
    } catch {
      message.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/admin/campaigns/${id}`, { method: 'DELETE' });
      message.success('Đã xóa campaign');
      fetchCampaigns();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={typeColors[type as CampaignType]}>{typeLabels[type as CampaignType]}</Tag>,
    },
    {
      title: 'Thời gian',
      key: 'period',
      render: (_, r) => (
        <span style={{ fontSize: 13 }}>
          {new Date(r.startDate).toLocaleDateString('vi-VN')} →{' '}
          {new Date(r.endDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Đã dùng',
      key: 'redemptions',
      render: (_, r) => (
        <span>
          {r._count.redemptions}
          {r.maxRedemptions ? ` / ${r.maxRedemptions}` : ''}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => <Tag color={v ? 'success' : 'default'}>{v ? 'Hoạt động' : 'Tắt'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa campaign này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Campaigns</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo Campaign</Button>
      </div>

      <Card>
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
            showTotal: (t) => `${t} campaigns`,
          }}
        />
      </Card>

      <Modal
        title={editing ? 'Chỉnh sửa Campaign' : 'Tạo Campaign mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        width={640}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <FormItem name="name" label="Tên campaign" rules={[{ required: true }]}>
            <Input />
          </FormItem>
          <FormItem name="description" label="Mô tả">
            <TextArea rows={2} />
          </FormItem>
          <FormItem name="type" label="Loại" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'DISCOUNT', label: 'Giảm giá (%)' },
                { value: 'FREE_TRIAL', label: 'Dùng thử tính năng' },
                { value: 'EXTEND_SUBSCRIPTION', label: 'Gia hạn gói' },
              ]}
            />
          </FormItem>

          <FormItem shouldUpdate={(prev, cur) => prev.type !== cur.type} noStyle>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              return (
                <>
                  {type === 'DISCOUNT' && (
                    <FormItem name="discountPercent" label="% Giảm giá" rules={[{ required: true }]}>
                      <InputNumber min={1} max={100} addonAfter="%" style={{ width: '100%' }} />
                    </FormItem>
                  )}
                  {type === 'FREE_TRIAL' && (
                    <>
                      <FormItem name="featureKey" label="Feature Key" rules={[{ required: true }]}>
                        <Input placeholder="e.g. premium_report" />
                      </FormItem>
                      <FormItem name="trialDays" label="Số ngày thử" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </FormItem>
                    </>
                  )}
                  {type === 'EXTEND_SUBSCRIPTION' && (
                    <FormItem name="days" label="Số ngày gia hạn" rules={[{ required: true }]}>
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </FormItem>
                  )}
                </>
              );
            }}
          </FormItem>

          <FormItem name="dateRange" label="Thời gian hiệu lực" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </FormItem>
          <FormItem name="targetTags" label="Tags điều kiện (cách nhau dấu phẩy)">
            <Input placeholder="e.g. vip, beta" />
          </FormItem>
          <FormItem name="maxRedemptions" label="Giới hạn lượt dùng (để trống = không giới hạn)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </FormItem>
          <FormItem name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
}
