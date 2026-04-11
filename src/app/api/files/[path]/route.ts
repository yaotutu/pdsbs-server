import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// 文件服务路由：提供 uploads/ 目录下的文件访问
// 替代 Next.js 的 public/ 静态文件服务，解决生产模式下新上传文件无法访问的问题
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path: filename } = await params;

  // 防止路径穿越攻击
  const uploadsDir = path.join(process.cwd(), "uploads");
  const filepath = path.join(uploadsDir, filename);
  const resolved = path.resolve(filepath);

  if (!resolved.startsWith(path.resolve(uploadsDir))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) {
      return new Response("Not Found", { status: 404 });
    }

    const buffer = await readFile(resolved);

    // 根据 extension 推断 Content-Type
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
