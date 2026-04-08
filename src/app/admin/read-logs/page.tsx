"use client";

import { useEffect, useState } from "react";
import { Table, Typography } from "antd";

const { Title } = Typography;

interface ReadLog {
  id: number;
  readAt: string;
  duration: number | null;
  ip: string;
  user: { id: number; nickname: string; avatarUrl: string };
  article: { id: number; title: string };
}

export default function ReadLogsPage() {
  const [logs, setLogs] = useState<ReadLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");
    const res = await fetch(`/api/admin/read-logs?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      setLogs(data.data.list);
      setTotal(data.data.total);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: "用户",
      width: 120,
      render: (_: unknown, record: ReadLog) => record.user.nickname || `用户${record.user.id}`,
    },
    {
      title: "文章",
      dataIndex: ["article", "title"],
    },
    {
      title: "阅读时间",
      dataIndex: "readAt",
      width: 180,
      render: (d: string) => new Date(d).toLocaleString("zh-CN"),
    },
    {
      title: "阅读时长",
      dataIndex: "duration",
      width: 100,
      render: (d: number | null) => (d ? `${d}秒` : "-"),
    },
    { title: "IP", dataIndex: "ip", width: 130 },
  ];

  return (
    <div>
      <Title level={4}>阅读记录</Title>
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
      />
    </div>
  );
}
