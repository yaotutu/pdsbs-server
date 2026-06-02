import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/response";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { getAppSettings, normalizeInternalPhones, parseInternalPhones } from "@/lib/settings";

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
    internalPhones: parseInternalPhones(settings.internalPhones),
  });
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) return error("无权限", -1, 403);

  try {
    const body = await req.json();
    const data: { guestAccessEnabled?: boolean; internalPhones?: string } = {};

    if (body.guestAccessEnabled !== undefined) {
      if (typeof body.guestAccessEnabled !== "boolean") {
        return error("游客访问开关参数错误");
      }
      data.guestAccessEnabled = body.guestAccessEnabled;
    }

    if (body.internalPhones !== undefined) {
      if (!Array.isArray(body.internalPhones)) {
        return error("内部手机号参数错误");
      }
      data.internalPhones = JSON.stringify(normalizeInternalPhones(body.internalPhones));
    }

    if (Object.keys(data).length === 0) {
      return error("没有可保存的设置");
    }

    const settings = await prisma.appSetting.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        guestAccessEnabled: data.guestAccessEnabled ?? false,
        internalPhones: data.internalPhones ?? "[]",
      },
    });

    return success({
      guestAccessEnabled: settings.guestAccessEnabled,
      internalPhones: parseInternalPhones(settings.internalPhones),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "保存失败";
    return error(msg);
  }
}
