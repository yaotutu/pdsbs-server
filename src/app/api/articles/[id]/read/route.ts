import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, unauthorized } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// 记录阅读行为（核心）
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return unauthorized();

  const { id } = await params;
  const articleId = parseInt(id);
  const body = await req.json().catch(() => ({}));

  try {
    // 检查文章是否存在
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return error("文章不存在", -1, 404);

    // 记录阅读行为
    const readLog = await prisma.readLog.create({
      data: {
        userId: payload.userId,
        articleId,
        duration: body.duration || null,
        ip: req.headers.get("x-forwarded-for") || "",
      },
    });

    // 文章阅读量 +1
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });

    return success(readLog);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "记录失败";
    return error(msg);
  }
}
