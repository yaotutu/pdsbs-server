"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Space, Tag, Popconfirm, message, Input, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

interface Article {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  createdAt: string;
  category: { id: number; name: string };
  author: { id: number; nickname: string };
}

interface Category {
  id: number;
  name: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchArticles = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      status: "", // 管理端看所有状态
    });
    if (keyword) params.set("keyword", keyword);
    if (categoryId) params.set("category", categoryId);

    const res = await fetch(`/api/articles?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      setArticles(data.data.list);
      setTotal(data.data.total);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) setCategories(data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch(`/api/articles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      message.success("删除成功");
      fetchArticles();
    } else {
      message.error(data.message);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title" },
    { title: "分类", dataIndex: ["category", "name"], width: 100 },
    { title: "作者", dataIndex: ["author", "nickname"], width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (s: string) =>
        s === "published" ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>,
    },
    { title: "阅读量", dataIndex: "viewCount", width: 80 },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
      render: (d: string) => new Date(d).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      width: 150,
      render: (_: unknown, record: Article) => (
        <Space>
          <Button size="small" onClick={() => router.push(`/admin/articles/edit/${record.id}`)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="搜索文章"
            onSearch={(v) => { setKeyword(v); setPage(1); fetchArticles(); }}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 120 }}
            onChange={(v) => { setCategoryId(v); setPage(1); fetchArticles(); }}
            options={categories.map((c) => ({ label: c.name, value: c.id.toString() }))}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/admin/articles/edit/new")}>
          新建文章
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage }}
      />
    </div>
  );
}
