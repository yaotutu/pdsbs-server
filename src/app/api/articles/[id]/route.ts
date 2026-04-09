import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// 获取文章详情（需登录，后端自动记录阅读行为）
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 验证用户登录状态
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return error("请先登录", -1, 401);

  const { id } = await params;
  const articleId = parseInt(id);

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true, author: { select: { id: true, nickname: true } }, images: true },
  });

  if (!article) return error("文章不存在", -1, 404);

  // 后端自动记录阅读行为：创建阅读日志 + 文章阅读量 +1
  await Promise.all([
    prisma.readLog.create({
      data: {
        userId: payload.userId,
        articleId,
        ip: req.headers.get("x-forwarded-for") || "",
      },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);

  return success(article);
}

// 更新文章（管理员）
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, content, summary, coverImage, categoryId, status, images } = body;

    // 如果有图片列表，先删除旧图片再创建新的
    if (images !== undefined) {
      await prisma.articleImage.deleteMany({ where: { articleId: parseInt(id) } });
    }

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(summary !== undefined && { summary }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categoryId !== undefined && { categoryId }),
        ...(status !== undefined && { status }),
        ...(images !== undefined && {
          images: { create: images.map((url: string, i: number) => ({ url, sortOrder: i })) },
        }),
      },
      include: { category: true, images: true },
    });

    return success(article);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "更新失败";
    return error(msg);
  }
}

// 删除文章（管理员）
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  const { id } = await params;
  try {
    await prisma.article.delete({ where: { id: parseInt(id) } });
    return success(null, "删除成功");
  } catch {
    return error("删除失败");
  }
}
