import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";

function verifyAdmin(req: NextRequest) {
  const token = getTokenFromHeader(req.headers);
  const payload = token ? verifyToken(token) : null;
  return payload?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return error("无权限", -1, 403);

  const settings = await getAppSettings();
  return success({
    guestAccessEnabled: settings.guestAccessEnabled,
  });
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) return error("无权限", -1, 403);

  try {
    const body = await req.json();
    if (typeof body.guestAccessEnabled !== "boolean") {
      return error("游客访问开关参数错误");
    }

    const settings = await prisma.appSetting.upsert({
      where: { id: 1 },
      update: {
        guestAccessEnabled: body.guestAccessEnabled,
      },
      create: {
        id: 1,
        guestAccessEnabled: body.guestAccessEnabled,
      },
    });

    return success({
      guestAccessEnabled: settings.guestAccessEnabled,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "保存失败";
    return error(msg);
  }
}
