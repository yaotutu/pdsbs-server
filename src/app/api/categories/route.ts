import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// 获取分类列表
export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return success(categories);
}

// 创建分类（管理员）
export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  try {
    const { name, icon, sortOrder } = await req.json();
    if (!name) return error("分类名称不能为空");

    const category = await prisma.category.create({
      data: { name, icon: icon || "", sortOrder: sortOrder || 0 },
    });
    return success(category);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "创建失败";
    return error(msg);
  }
}
