import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { code2Session } from "@/lib/wx";
import { signToken } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) return error("缺少 code 参数");

    const session = await code2Session(code);
    if (!session.openid) return error("微信登录失败");

    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { openid: session.openid } });
    if (!user) {
      user = await prisma.user.create({
        data: { openid: session.openid },
      });
    }

    const token = signToken({ userId: user.id, role: user.role, openid: user.openid });

    return success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "登录失败";
    return error(msg);
  }
}
