"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Upload,
  message,
  App,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface Category {
  id: number;
  name: string;
}

export default function ArticleEditPage() {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    // 加载分类
    fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((r) => r.code === 0 && setCategories(r.data));

    // 加载文章（编辑模式）
    if (!isNew) {
      fetch(`/api/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((r) => {
          if (r.code === 0) {
            const a = r.data;
            form.setFieldsValue({
              title: a.title,
              summary: a.summary,
              categoryId: a.categoryId,
              status: a.status,
            });
            setContent(a.content);
            setCoverImage(a.coverImage);
          }
        });
    }
  }, [id, isNew]);

  const handleUpload = async (file: File) => {
    const token = localStorage.getItem("admin_token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (data.code === 0) return data.data.url;
    message.error("上传失败");
    return "";
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");
    const body = { ...values, content, coverImage };

    try {
      const url = isNew ? "/api/articles" : `/api/articles/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.code === 0) {
        message.success(isNew ? "创建成功" : "保存成功");
        router.push("/admin/articles");
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isNew ? "新建文章" : "编辑文章"}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 800 }}>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
          <Input placeholder="请输入文章标题" />
        </Form.Item>

        <Form.Item name="summary" label="摘要">
          <Input.TextArea rows={2} placeholder="请输入文章摘要" />
        </Form.Item>

        <Form.Item label="封面图">
          {coverImage && (
            <div style={{ marginBottom: 8 }}>
              <img src={coverImage} alt="cover" style={{ maxHeight: 120 }} />
            </div>
          )}
          <Upload
            beforeUpload={async (file) => {
              const url = await handleUpload(file);
              if (url) setCoverImage(url);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<PlusOutlined />}>上传封面</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="正文内容">
          <Input.TextArea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入文章正文（支持HTML）"
          />
        </Form.Item>

        <Space>
          <Form.Item name="categoryId" label="分类">
            <Select
              style={{ width: 200 }}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              placeholder="请选择分类"
            />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue="draft">
            <Select
              style={{ width: 120 }}
              options={[
                { label: "草稿", value: "draft" },
                { label: "发布", value: "published" },
              ]}
            />
          </Form.Item>
        </Space>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button onClick={() => router.push("/admin/articles")}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
