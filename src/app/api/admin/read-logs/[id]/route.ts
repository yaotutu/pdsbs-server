import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const { id } = await params;
  const readLogId = parseInt(id);
  if (Number.isNaN(readLogId)) return error("阅读记录 ID 无效");

  try {
    await prisma.readLog.delete({ where: { id: readLogId } });
    return success(null, "删除成功");
  } catch {
    return error("阅读记录不存在", -1, 404);
  }
}
