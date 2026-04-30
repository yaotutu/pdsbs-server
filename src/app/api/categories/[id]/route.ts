import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// 更新分类（管理员）
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const { id } = await params;
  try {
    const { name, icon, sortOrder, isActive } = await req.json();

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return success(category);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "更新失败";
    return error(msg);
  }
}

// 删除分类（管理员）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    return success(null, "删除成功");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "删除失败";
    return error(msg);
  }
}
