"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReadLog {
  id: number;
  readAt: string;
  duration: number | null;
  ip: string;
  user: { id: number; nickname: string; avatarUrl: string; phone: string; openid: string };
  article: { id: number; title: string };
}

export default function ReadLogsPage() {
  const [logs, setLogs] = useState<ReadLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ReadLog | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = useCallback(async (nextPage = page) => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch(`/api/admin/read-logs?page=${nextPage}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      setLogs(data.data.list);
      setTotal(data.data.total);
    } else {
      toast.error(data.message || "阅读记录加载失败");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    let ignore = false;

    async function loadLogs() {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/read-logs?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (ignore) return;

      if (data.code === 0) {
        setLogs(data.data.list);
        setTotal(data.data.total);
      } else {
        toast.error(data.message || "阅读记录加载失败");
      }
      setLoading(false);
    }

    loadLogs();

    return () => {
      ignore = true;
    };
  }, [page]);

  const totalPages = Math.ceil(total / 20);

  const refreshAfterDelete = async (deletedCount: number) => {
    const nextTotal = Math.max(total - deletedCount, 0);
    const nextTotalPages = Math.ceil(nextTotal / 20);
    const nextPage = page > 1 && page > nextTotalPages ? page - 1 : page;

    if (nextPage !== page) {
      setPage(nextPage);
      return;
    }

    await fetchLogs(nextPage);
  };

  const handleDeleteOne = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/read-logs/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success("删除成功");
        setDeleteTarget(null);
        await refreshAfterDelete(1);
      } else {
        toast.error(data.message || "删除失败");
      }
    } catch {
      toast.error("删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (deleting) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/read-logs", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success(`已删除 ${data.data.count} 条阅读记录`);
        setClearDialogOpen(false);
        setPage(1);
        await fetchLogs(1);
      } else {
        toast.error(data.message || "清空失败");
      }
    } catch {
      toast.error("清空失败");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">阅读记录</h1>
        <Button
          variant="destructive"
          disabled={loading || deleting || total === 0}
          onClick={() => setClearDialogOpen(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          清空记录
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead className="w-28">手机号</TableHead>
              <TableHead className="w-28">昵称</TableHead>
              <TableHead>文章</TableHead>
              <TableHead className="w-40">阅读时间</TableHead>
              <TableHead className="w-32">IP</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  加载中...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.user.phone || "-"}</TableCell>
                  <TableCell>{log.user.nickname || `用户${log.user.id}`}</TableCell>
                  <TableCell>{log.article.title}</TableCell>
                  <TableCell>{new Date(log.readAt).toLocaleString("zh-CN")}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deleting}
                      onClick={() => setDeleteTarget(log)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">共 {total} 条</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              上一页
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              下一页
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除阅读记录</DialogTitle>
            <DialogDescription>
              确定删除这条阅读记录？该操作不会影响文章阅读量。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDeleteOne}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空阅读记录</DialogTitle>
            <DialogDescription>
              确定删除全部阅读记录？该操作不会影响文章阅读量。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setClearDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleClearAll}>
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
