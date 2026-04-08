"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  if (!stats) return <div className="text-muted-foreground">加载中...</div>;

  const statCards = [
    { title: "已发布文章", value: stats.totalArticles, icon: FileText },
    { title: "注册用户", value: stats.totalUsers, icon: Users },
    { title: "总阅读量", value: stats.totalReads, icon: BookOpen },
    { title: "今日阅读", value: stats.todayReads, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">近7天阅读趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.dailyStats).map(([date, count]) => (
                <div key={date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{date}</span>
                  <span className="font-medium">{count} 次</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">热门文章 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">排名</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead className="w-20 text-right">阅读量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topArticles.map((a, i) => (
                  <TableRow key={a.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{a.title}</TableCell>
                    <TableCell className="text-right">{a.viewCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
