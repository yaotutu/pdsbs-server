import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success } from "@/lib/response";

// 获取启用的轮播图列表（公开接口，供小程序调用）
export async function GET(req: NextRequest) {
  // 优先使用环境变量中的基础地址，兜底使用请求来源
  const baseUrl = process.env.APP_URL || req.nextUrl.origin;
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      linkUrl: true,
    },
  });

  const result = banners.map((b) => ({
    ...b,
    imageUrl: `${baseUrl}${b.imageUrl}`,
  }));

  return success(result);
}
