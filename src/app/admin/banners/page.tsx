"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 轮播图数据类型
interface Banner {
  id: number;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // 表单字段
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingSort, setSavingSort] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderedBanners = [...banners].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );

  // 获取轮播图列表
  const fetchBanners = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/admin/banners", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) setBanners(data.data);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // 打开新建对话框
  const openCreate = () => {
    setEditId(null);
    setFormImageUrl("");
    setFormSortOrder(
      orderedBanners.length
        ? Math.max(...orderedBanners.map((b) => b.sortOrder)) + 10
        : 10
    );
    setFormActive(true);
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setFormImageUrl(b.imageUrl);
    setFormSortOrder(b.sortOrder);
    setFormActive(b.isActive);
    setDialogOpen(true);
  };

  // 图片上传处理
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.code === 0) {
        setFormImageUrl(data.data.url);
        toast.success("图片上传成功");
      } else {
        toast.error(data.message || "上传失败");
      }
    } catch {
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  // 提交表单（新建或编辑）
  const handleSubmit = async () => {
    if (!formImageUrl) {
      toast.error("请上传轮播图图片");
      return;
    }
    const token = localStorage.getItem("admin_token");
    const url = editId ? `/api/admin/banners/${editId}` : "/api/admin/banners";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl: formImageUrl,
        isActive: formActive,
        ...(!editId && { sortOrder: formSortOrder }),
      }),
    });
    const data = await res.json();
    if (data.code === 0) {
      toast.success(editId ? "更新成功" : "创建成功");
      setDialogOpen(false);
      fetchBanners();
    } else {
      toast.error(data.message);
    }
  };

  const persistBannerOrders = async (nextBanners: Banner[], message: string) => {
    const token = localStorage.getItem("admin_token");
    const updates = nextBanners
      .map((b, index) => ({ ...b, nextSortOrder: (index + 1) * 10 }))
      .filter((b) => b.sortOrder !== b.nextSortOrder);

    if (updates.length === 0) return;

    setSavingSort(true);
    try {
      const results = await Promise.all(
        updates.map((b) =>
          fetch(`/api/admin/banners/${b.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sortOrder: b.nextSortOrder }),
          }).then((res) => res.json())
        )
      );

      const failed = results.find((data) => data.code !== 0);
      if (failed) {
        toast.error(failed.message || "排序保存失败");
        return;
      }

      toast.success(message);
      fetchBanners();
    } catch {
      toast.error("排序保存失败");
    } finally {
      setSavingSort(false);
    }
  };

  const moveBanner = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedBanners.length || savingSort) return;
    const nextBanners = [...orderedBanners];
    const [item] = nextBanners.splice(fromIndex, 1);
    nextBanners.splice(toIndex, 0, item);
    persistBannerOrders(nextBanners, "排序已更新");
  };

  const normalizeBannerOrders = () => {
    if (savingSort) return;
    persistBannerOrders(orderedBanners, "排序已整理");
  };

  // 删除轮播图
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      toast.success("删除成功");
      fetchBanners();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">轮播图管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={normalizeBannerOrders} disabled={savingSort || banners.length === 0}>
            <RotateCcw className="mr-1 h-4 w-4" /> 整理排序
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> 新建轮播图
          </Button>
        </div>
      </div>

      {/* 轮播图列表 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead className="w-32">图片</TableHead>
              <TableHead className="w-40">顺序</TableHead>
              <TableHead className="w-20">状态</TableHead>
              <TableHead className="w-28">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedBanners.map((b, index) => (
              <TableRow key={b.id}>
                <TableCell>{b.id}</TableCell>
                <TableCell>
                  {b.imageUrl && (
                    <img
                      src={b.imageUrl}
                      alt="轮播图"
                      className="h-12 w-20 rounded object-cover"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="上移"
                        disabled={savingSort || index === 0}
                        onClick={() => moveBanner(index, index - 1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="下移"
                        disabled={savingSort || index === orderedBanners.length - 1}
                        onClick={() => moveBanner(index, index + 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="min-w-20">
                      <div className="font-medium">第 {index + 1} 位</div>
                      <div className="text-xs text-muted-foreground">排序值 {b.sortOrder}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={b.isActive ? "text-green-600" : "text-muted-foreground"}>
                    {b.isActive ? "启用" : "禁用"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  暂无轮播图，点击上方按钮新建
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "编辑轮播图" : "新建轮播图"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 图片上传 */}
            <div className="space-y-2">
              <Label>轮播图图片</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1 h-4 w-4" />
                  {uploading ? "上传中..." : "上传图片"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
                {formImageUrl && (
                  <img
                    src={formImageUrl}
                    alt="预览"
                    className="h-12 w-20 rounded object-cover"
                  />
                )}
              </div>
            </div>

            {/* 启用状态 */}
            <div className="flex items-center gap-3">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>启用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
