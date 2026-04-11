import { NextRequest } from "next/server";

/**
 * 将 HTML 内容中的相对路径图片 URL 替换为完整地址
 * 小程序端需要绝对路径才能正确加载图片
 */
export const resolveContentUrls = (html: string, req: NextRequest): string => {
  const baseUrl = process.env.APP_URL || req.nextUrl.origin;
  return html.replace(/src="(\/[^"]+)"/g, `src="${baseUrl}$1"`);
};

/**
 * 从 HTML 内容中提取第一张图片的 src 地址
 * 用于在没有手动上传封面图时自动设置封面
 */
export const extractFirstImage = (html: string): string => {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1] || "";
};

/**
 * 将单个相对路径转为完整地址
 */
export const resolveUrl = (url: string, req: NextRequest): string => {
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.APP_URL || req.nextUrl.origin;
  return `${baseUrl}${url}`;
};
