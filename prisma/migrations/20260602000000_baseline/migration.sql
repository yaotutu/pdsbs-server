-- Baseline migration for the existing SQLite schema.
-- Existing production databases should mark this migration as applied with:
-- npx prisma migrate resolve --applied 20260602000000_baseline

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "openid" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" INTEGER NOT NULL DEFAULT 1,
    "authorId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "articleId" INTEGER NOT NULL,
    CONSTRAINT "ArticleImage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "ip" TEXT NOT NULL DEFAULT '',
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    CONSTRAINT "ReadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadLog_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_openid_key" ON "User"("openid");
