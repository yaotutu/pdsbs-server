import prisma from "@/lib/prisma";

const APP_SETTING_ID = 1;

export async function getAppSettings() {
  return prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: {},
    create: {
      id: APP_SETTING_ID,
      guestAccessEnabled: false,
    },
  });
}

export async function getGuestAccessEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.guestAccessEnabled;
}
