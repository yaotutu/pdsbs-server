"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, Pencil, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFormSortOrder(banners.length + 1);
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
        sortOrder: formSortOrder,
        isActive: formActive,
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
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> 新建轮播图
        </Button>
      </div>

      {/* 轮播图列表 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead className="w-32">图片</TableHead>
              <TableHead className="w-20">排序</TableHead>
              <TableHead className="w-20">状态</TableHead>
              <TableHead className="w-28">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((b) => (
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
                <TableCell>{b.sortOrder}</TableCell>
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

            {/* 排序 */}
            <div className="space-y-2">
              <Label htmlFor="banner-sort">排序</Label>
              <Input
                id="banner-sort"
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
              />
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
