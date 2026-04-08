"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface Category {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) setCategories(data.data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (values: { name: string; icon?: string; sortOrder?: number }) => {
    const token = localStorage.getItem("admin_token");
    // 简化：目前只有创建，后续可以加编辑
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.code === 0) {
      message.success("创建成功");
      setModalOpen(false);
      form.resetFields();
      fetchCategories();
    } else {
      message.error(data.message);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "名称", dataIndex: "name" },
    { title: "图标", dataIndex: "icon" },
    { title: "排序", dataIndex: "sortOrder", width: 80 },
    {
      title: "状态",
      dataIndex: "isActive",
      width: 80,
      render: (v: boolean) => (v ? "启用" : "禁用"),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建分类
        </Button>
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" pagination={false} />

      <Modal
        title="新建分类"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="分类名称" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="图标（可选）" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序" initialValue={0}>
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
