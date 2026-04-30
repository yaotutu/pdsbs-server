import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { getTokenFromHeader, isGuestAccessEnabled, verifyToken } from "@/lib/auth";
import { resolveContentUrls, extractFirstImage } from "@/lib/url";

// 获取文章详情（正常模式需登录，游客访问模式下跳过登录校验）
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guestAccessEnabled = isGuestAccessEnabled();
  let user: { id: number } | null = null;

  if (!guestAccessEnabled) {
    // 验证用户登录状态
    const token = getTokenFromHeader(req.headers);
    const payload = token ? verifyToken(token) : null;
    if (!payload) return error("请先登录", -1, 401);

    user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });
    if (!user) return error("登录已失效，请重新登录", -1, 401);
  }

  const { id } = await params;
  const articleId = parseInt(id);

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true, author: { select: { id: true, nickname: true } }, images: true },
  });

  if (!article) return error("文章不存在", -1, 404);

  // 将文章内容中的相对图片路径替换为完整地址（小程序端需要）
  article.content = resolveContentUrls(article.content || "", req);
  if (article.coverImage && !article.coverImage.startsWith("http")) {
    article.coverImage = `${process.env.APP_URL || req.nextUrl.origin}${article.coverImage}`;
  }

  // 后端自动记录阅读行为：真实用户写阅读日志，所有访问都会增加阅读量
  // 阅读相关副作用失败不应阻塞文章详情返回
  const readEffects: Promise<unknown>[] = [
    prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    }).catch((e) => {
      console.error("[文章阅读量更新失败]", e);
    }),
  ];

  if (user) {
    readEffects.push(
      prisma.readLog.create({
        data: {
          userId: user.id,
          articleId,
          ip: req.headers.get("x-forwarded-for") || "",
        },
      }).catch((e) => {
        console.error("[阅读记录写入失败]", e);
      })
    );
  }

  await Promise.all(readEffects);

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

    // 如果没有上传封面图，自动从正文中提取第一张图片作为封面
    const finalCoverImage = coverImage !== undefined
      ? (coverImage || extractFirstImage(content || ""))
      : undefined;

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(summary !== undefined && { summary }),
        ...(finalCoverImage !== undefined && { coverImage: finalCoverImage }),
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
