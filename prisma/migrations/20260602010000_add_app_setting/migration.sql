-- CreateTable
CREATE TABLE "AppSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "guestAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Seed the singleton settings row with conservative defaults.
INSERT INTO "AppSetting" ("id", "guestAccessEnabled", "createdAt", "updatedAt")
VALUES (1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
