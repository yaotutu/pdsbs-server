import { NextRequest } from "next/server";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { uploadToOSS } from "@/lib/oss";
import path from "path";

// 文件上传接口（管理员）
// 文件上传到京东云 OSS，返回 OSS 访问 URL
export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error("请选择文件");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名，按日期分目录
    const ext = path.extname(file.name) || ".jpg";
    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const key = `uploads/${datePath}/${filename}`;

    // MIME 类型映射
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    const contentType = mimeTypes[ext.toLowerCase()] || "application/octet-stream";

    const url = await uploadToOSS(buffer, key, contentType);

    return success({ url, filename: key });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "上传失败";
    return error(msg);
  }
}
