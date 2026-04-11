import { NextRequest } from "next/server";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 文件上传接口（管理员）
// 文件存储在项目根目录的 uploads/ 中，通过 /api/files/[path] 路由提供访问
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

    // 生成唯一文件名
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // 返回的 URL 指向文件服务路由
    return success({ url: `/api/files/${filename}`, filename });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "上传失败";
    return error(msg);
  }
}
