'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Input, Space, Typography, Card, Popconfirm, Modal, Form, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface TagItem {
  id: string;
  name: string;
  _count: { users: number };
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [form] = Form.useForm();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<TagItem[]>('/admin/tags');
      setTags(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const openCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (tag: TagItem) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name });
    setModalOpen(true);
  };

  const onFinish = async (values: { name: string }) => {
    if (editingTag) {
      await apiFetch(`/admin/tags/${editingTag.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: values.name }),
      });
      message.success('Đã cập nhật tag');
    } else {
      await apiFetch('/admin/tags', {
        method: 'POST',
        body: JSON.stringify({ name: values.name }),
      });
      message.success('Đã tạo tag');
    }
    setModalOpen(false);
    fetchTags();
  };

  const deleteTag = async (id: string) => {
    await apiFetch(`/admin/tags/${id}`, { method: 'DELETE' });
    message.success('Đã xóa tag');
    fetchTags();
  };

  const columns: ColumnsType<TagItem> = [
    { title: 'Tên tag', dataIndex: 'name', key: 'name' },
    {
      title: 'Số users',
      key: 'count',
      render: (_, record) => record._count?.users ?? 0,
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm
            title={`Xóa tag "${record.name}"? Tag sẽ bị bỏ khỏi tất cả users.`}
            onConfirm={() => deleteTag(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Tags</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo tag
        </Button>
      </div>

      <Card>
        <Table
          rowKey="id"
          dataSource={tags}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingTag ? 'Sửa tag' : 'Tạo tag mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Tên tag"
            rules={[{ required: true, message: 'Nhập tên tag' }]}
          >
            <Input placeholder="vd: premium-user, beta-tester..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTag ? 'Cập nhật' : 'Tạo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
