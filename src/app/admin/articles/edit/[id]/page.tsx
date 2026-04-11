"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 动态导入富文本编辑器（仅客户端加载，避免 SSR 问题）
const TipTapEditor = dynamic(
  () => import("@/components/editor/TipTapEditor"),
  { ssr: false, loading: () => <div className="h-[500px] border rounded-md flex items-center justify-center text-muted-foreground">编辑器加载中...</div> }
);

interface Category {
  id: number;
  name: string;
}

export default function ArticleEditPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((r) => r.code === 0 && setCategories(r.data));

    if (!isNew) {
      fetch(`/api/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((r) => {
          if (r.code === 0) {
            const a = r.data;
            setTitle(a.title);
            setSummary(a.summary || "");
            setContent(a.content || "");
            setCoverImage(a.coverImage || "");
            setCategoryId(a.categoryId?.toString() || "");
            setStatus(a.status || "draft");
          }
        });
    }
  }, [id, isNew]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      setCoverImage(data.data.url);
    } else {
      toast.error("上传失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { toast.error("请输入标题"); return; }
    setLoading(true);
    const token = localStorage.getItem("admin_token");
    const body = {
      title,
      summary,
      content,
      coverImage,
      categoryId: categoryId ? parseInt(categoryId) : null,
      status,
    };

    try {
      const url = isNew ? "/api/articles" : `/api/articles/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success(isNew ? "创建成功" : "保存成功");
        router.push("/admin/articles");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>{isNew ? "新建文章" : "编辑文章"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="请输入文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">摘要</Label>
            <Textarea
              id="summary"
              rows={2}
              placeholder="请输入文章摘要"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>封面图</Label>
            {coverImage && (
              <div className="mb-2">
                <img src={coverImage} alt="cover" className="max-h-32 rounded-md" />
              </div>
            )}
            <Button type="button" variant="outline" onClick={() => document.getElementById("cover-upload")?.click()}>
              <Upload className="mr-1 h-4 w-4" /> 上传封面
            </Button>
            <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          <div className="space-y-2">
            <Label>正文内容</Label>
            <TipTapEditor
              value={content}
              onChange={setContent}
              height={500}
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/articles")}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
