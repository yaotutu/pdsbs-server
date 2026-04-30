"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [savingSort, setSavingSort] = useState(false);

  const orderedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/categories?all=true", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) setCategories(data.data);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditId(null);
    setFormName("");
    setFormSortOrder(
      orderedCategories.length
        ? Math.max(...orderedCategories.map((c) => c.sortOrder)) + 10
        : 10
    );
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setFormName(c.name);
    setFormSortOrder(c.sortOrder);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName) {
      toast.error("请输入分类名称");
      return;
    }
    const token = localStorage.getItem("admin_token");
    const url = editId ? `/api/categories/${editId}` : "/api/categories";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: formName,
        ...(!editId && { sortOrder: formSortOrder }),
      }),
    });
    const data = await res.json();
    if (data.code === 0) {
      toast.success(editId ? "更新成功" : "创建成功");
      setDialogOpen(false);
      fetchCategories();
    } else {
      toast.error(data.message);
    }
  };

  const persistCategoryOrders = async (nextCategories: Category[], message: string) => {
    const token = localStorage.getItem("admin_token");
    const updates = nextCategories
      .map((c, index) => ({ ...c, nextSortOrder: (index + 1) * 10 }))
      .filter((c) => c.sortOrder !== c.nextSortOrder);

    if (updates.length === 0) return;

    setSavingSort(true);
    try {
      const results = await Promise.all(
        updates.map((c) =>
          fetch(`/api/categories/${c.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sortOrder: c.nextSortOrder }),
          }).then((res) => res.json())
        )
      );

      const failed = results.find((data) => data.code !== 0);
      if (failed) {
        toast.error(failed.message || "排序保存失败");
        return;
      }

      toast.success(message);
      fetchCategories();
    } catch {
      toast.error("排序保存失败");
    } finally {
      setSavingSort(false);
    }
  };

  const moveCategory = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedCategories.length || savingSort) return;
    const nextCategories = [...orderedCategories];
    const [item] = nextCategories.splice(fromIndex, 1);
    nextCategories.splice(toIndex, 0, item);
    persistCategoryOrders(nextCategories, "排序已更新");
  };

  const normalizeCategoryOrders = () => {
    if (savingSort) return;
    persistCategoryOrders(orderedCategories, "排序已整理");
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code === 0) {
      toast.success("删除成功");
      fetchCategories();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <>
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={normalizeCategoryOrders} disabled={savingSort || categories.length === 0}>
            <RotateCcw className="mr-1 h-4 w-4" /> 整理排序
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> 新建分类
          </Button>
        </div>
      </div>

      {/* 表格 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">名称</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">顺序</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  暂无分类，点击上方按钮创建
                </td>
              </tr>
            ) : (
              orderedCategories.map((c, index) => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-2.5">{c.id}</td>
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="上移"
                          disabled={savingSort || index === 0}
                          onClick={() => moveCategory(index, index - 1)}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="下移"
                          disabled={savingSort || index === orderedCategories.length - 1}
                          onClick={() => moveCategory(index, index + 1)}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="min-w-20">
                        <div className="font-medium">第 {index + 1} 位</div>
                        <div className="text-xs text-muted-foreground">排序值 {c.sortOrder}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "编辑分类" : "新建分类"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">分类名称</Label>
              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="请输入分类名称"
              />
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
    </>
  );
}
