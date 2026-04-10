import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

// 获取文章列表
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  const keyword = searchParams.get("keyword");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");

  // 验证身份：管理后台可以查看所有状态的文章
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  const isAdmin = payload?.role === "admin";

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (status) where.status = status;
  // 非管理员（小程序端）只返回已发布的文章
  else if (!isAdmin) where.status = "published";
  if (keyword) where.title = { contains: keyword };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        author: { select: { id: true, nickname: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return success({ list: articles, total, page, limit });
}

// 创建文章（管理员）
export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return error("无权限", -1, 403);

  try {
    const body = await req.json();
    const { title, content, summary, coverImage, categoryId, status, images } = body;

    if (!title) return error("标题不能为空");

    const article = await prisma.article.create({
      data: {
        title,
        content: content || "",
        summary: summary || "",
        coverImage: coverImage || "",
        categoryId: categoryId || 1,
        authorId: payload.userId,
        status: status || "draft",
        images: images
          ? { create: images.map((url: string, i: number) => ({ url, sortOrder: i })) }
          : undefined,
      },
      include: { category: true, images: true },
    });

    return success(article);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "创建失败";
    return error(msg);
  }
}
