import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { success, error } from "@/lib/response";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return error("请输入用户名和密码");

    // 管理员用 openid 字段存储用户名
    const user = await prisma.user.findFirst({
      where: { openid: username, role: "admin" },
    });

    if (!user || !user.password) return error("用户名或密码错误");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return error("用户名或密码错误");

    const token = signToken({ userId: user.id, role: "admin", openid: user.openid });

    return success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "登录失败";
    return error(msg);
  }
}
