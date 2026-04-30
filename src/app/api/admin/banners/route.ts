import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// 获取所有轮播图（含禁用，管理端使用）
export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return success(banners);
}

// 创建轮播图（管理员）
export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  try {
    const { title, imageUrl, linkUrl, sortOrder, isActive } = await req.json();
    if (!imageUrl) return error("图片不能为空");

    const banner = await prisma.banner.create({
      data: {
        title: title || "",
        imageUrl,
        linkUrl: linkUrl || "",
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });
    return success(banner);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "创建失败";
    return error(msg);
  }
}
