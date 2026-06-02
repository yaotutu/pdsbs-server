import prisma from "@/lib/prisma";

const APP_SETTING_ID = 1;

export function normalizeInternalPhones(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => String(item).trim())
        .filter((item) => /^\d+$/.test(item))
    )
  );
}

export function parseInternalPhones(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    return normalizeInternalPhones(JSON.parse(value));
  } catch {
    return [];
  }
}

export async function getAppSettings() {
  return prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: {},
    create: {
      id: APP_SETTING_ID,
      guestAccessEnabled: false,
      internalPhones: "[]",
    },
  });
}

export async function getGuestAccessEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.guestAccessEnabled;
}

export async function getInternalPhones(): Promise<string[]> {
  const settings = await getAppSettings();
  return parseInternalPhones(settings.internalPhones);
}
