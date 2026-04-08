import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const [totalArticles, totalUsers, totalReads, todayReads] = await Promise.all([
    prisma.article.count({ where: { status: "published" } }),
    prisma.user.count({ where: { role: "user" } }),
    prisma.readLog.count(),
    prisma.readLog.count({
      where: {
        readAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // 最近7天每天的阅读量
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLogs = await prisma.readLog.findMany({
    where: { readAt: { gte: sevenDaysAgo } },
    select: { readAt: true },
  });

  const dailyStats: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyStats[key] = 0;
  }
  for (const log of recentLogs) {
    const key = log.readAt.toISOString().slice(0, 10);
    if (key in dailyStats) dailyStats[key]++;
  }

  // 热门文章 Top 5
  const topArticles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: { id: true, title: true, viewCount: true },
  });

  return success({
    totalArticles,
    totalUsers,
    totalReads,
    todayReads,
    dailyStats,
    topArticles,
  });
}
