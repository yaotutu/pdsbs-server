import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 管理后台页面守卫（排除登录页）
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("admin_token")?.value
      || req.headers.get("authorization")?.replace("Bearer ", "");

    const payload = token ? await verifyTokenEdge(token) : null;
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // 小程序端阅读记录接口需要登录
  if (pathname.match(/\/api\/articles\/\d+\/read/)) {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const payload = token ? await verifyTokenEdge(token) : null;
    if (!payload) {
      return NextResponse.json({ code: 401, message: "未登录", data: null }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/articles/:path*/read"],
};
