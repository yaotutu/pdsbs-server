"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  ReadOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface Stats {
  totalArticles: number;
  totalUsers: number;
  totalReads: number;
  todayReads: number;
  dailyStats: Record<string, number>;
  topArticles: { id: number; title: string; viewCount: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((r) => r.code === 0 && setStats(r.data));
  }, []);

  if (!stats) return <div>加载中...</div>;

  return (
    <div>
      <Title level={4}>仪表盘</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="已发布文章" value={stats.totalArticles} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="注册用户" value={stats.totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总阅读量" value={stats.totalReads} prefix={<ReadOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日阅读" value={stats.todayReads} prefix={<RiseOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="近7天阅读趋势">
            {Object.entries(stats.dailyStats).map(([date, count]) => (
              <div key={date} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>{date}</span>
                <span>{count} 次</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门文章 Top 5">
            <Table
              dataSource={stats.topArticles}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: "排名", render: (_, __, i) => i + 1, width: 60 },
                { title: "标题", dataIndex: "title" },
                { title: "阅读量", dataIndex: "viewCount", width: 100 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
