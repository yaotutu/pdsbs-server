import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const userId = searchParams.get("userId");
  const articleId = searchParams.get("articleId");

  const where: Record<string, unknown> = {};
  if (userId) where.userId = parseInt(userId);
  if (articleId) where.articleId = parseInt(articleId);

  const [logs, total] = await Promise.all([
    prisma.readLog.findMany({
      where,
      include: {
        user: { select: { id: true, nickname: true, avatarUrl: true } },
        article: { select: { id: true, title: true } },
      },
      orderBy: { readAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.readLog.count({ where }),
  ]);

  return success({ list: logs, total, page, limit });
}
