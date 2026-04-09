import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { success, error } from "@/lib/response";
import { code2Session, getPhoneNumber } from "@/lib/wx";

/**
 * 小程序登录接口
 *
 * 两种场景：
 * 1. 首次登录（需用户授权手机号）：传 code + phoneCode
 * 2. 静默续期（token 过期后）：只传 code，后端通过 openid 找到已有用户，直接发新 token
 */
export async function POST(req: NextRequest) {
  try {
    const { code, phoneCode, nickname, avatarUrl } = await req.json();

    // code 必填，用于换取 openid
    if (!code) return error("缺少登录 code");

    // 通过微信 code 换取 openid
    const session = await code2Session(code);
    if (!session.openid) return error("微信登录失败");

    // 根据 openid 查找已有用户
    let user = await prisma.user.findUnique({ where: { openid: session.openid } });

    if (user) {
      // 已有用户 → 更新可选字段（如果有传的话）
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(phoneCode && { phone: await getPhoneNumber(phoneCode) }),
          ...(nickname && { nickname }),
          ...(avatarUrl && { avatarUrl }),
        },
      });
    } else {
      // 新用户 → 必须传 phoneCode（首次登录需要授权手机号）
      if (!phoneCode) {
        return error("首次登录需要授权手机号", -2, 401);
      }
      const phone = await getPhoneNumber(phoneCode);
      user = await prisma.user.create({
        data: {
          openid: session.openid,
          phone,
          nickname: nickname || "",
          avatarUrl: avatarUrl || "",
          role: "user",
        },
      });
    }

    // 生成 JWT token（30 天有效）
    const token = signToken({ userId: user.id, role: user.role, openid: user.openid });

    return success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "登录失败";
    return error(msg);
  }
}
