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
    const body = await req.json();
    const { code, phoneCode, nickname, avatarUrl } = body;

    console.log("========== 小程序登录 ==========");
    console.log("[请求参数]", JSON.stringify({ code: code?.substring(0, 10) + "...", phoneCode: phoneCode ? phoneCode.substring(0, 10) + "..." : "未传", nickname, avatarUrl }, null, 2));

    // code 必填，用于换取 openid
    if (!code) {
      console.log("[错误] 缺少登录 code");
      return error("缺少登录 code");
    }

    // 通过微信 code 换取 openid
    console.log("[步骤1] 调用微信 code2Session...");
    const session = await code2Session(code);
    console.log("[步骤1] code2Session 结果:", JSON.stringify({ openid: session.openid?.substring(0, 10) + "...", errcode: session.errcode, errmsg: session.errmsg }));

    if (!session.openid) {
      console.log("[错误] 微信登录失败，未获取到 openid");
      return error("微信登录失败");
    }

    // 根据 openid 查找已有用户
    console.log("[步骤2] 查询用户，openid:", session.openid.substring(0, 10) + "...");
    let user = await prisma.user.findUnique({ where: { openid: session.openid } });
    console.log("[步骤2] 查询结果:", user ? `已有用户 id=${user.id}` : "新用户");

    if (user) {
      // 已有用户 → 更新可选字段（如果有传的话）
      console.log("[步骤3] 已有用户，更新可选字段...");
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(phoneCode && { phone: await getPhoneNumber(phoneCode) }),
          ...(nickname && { nickname }),
          ...(avatarUrl && { avatarUrl }),
        },
      });
      console.log("[步骤3] 用户信息已更新");
    } else {
      // 新用户 → 必须传 phoneCode（首次登录需要授权手机号）
      if (!phoneCode) {
        console.log("[错误] 新用户未传 phoneCode，需要授权手机号");
        return error("首次登录需要授权手机号", -2, 401);
      }
      console.log("[步骤3] 新用户，获取手机号...");
      const phone = await getPhoneNumber(phoneCode);
      console.log("[步骤3] 手机号获取成功:", phone.substring(0, 3) + "****" + phone.substring(7));

      user = await prisma.user.create({
        data: {
          openid: session.openid,
          phone,
          nickname: nickname || "",
          avatarUrl: avatarUrl || "",
          role: "user",
        },
      });
      console.log("[步骤3] 用户创建成功, id:", user.id);
    }

    // 生成 JWT token（永久有效）
    console.log("[步骤4] 生成 token...");
    const token = signToken({ userId: user.id, role: user.role, openid: user.openid });

    console.log("[完成] 登录成功, userId:", user.id);
    console.log("================================");

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
    console.error("[登录异常]", e instanceof Error ? e.stack : e);
    return error(msg);
  }
}
