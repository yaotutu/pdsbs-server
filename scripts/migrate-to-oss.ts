/**
 * 数据迁移脚本：将本地 uploads/ 目录的文件上传到京东云 OSS，并更新数据库中的 URL
 *
 * 用法：
 *   npx tsx scripts/migrate-to-oss.ts
 *
 * 需要在 .env 中配置以下环境变量：
 *   OSS_ENDPOINT        - OSS endpoint，如 https://s3.cn-north-1.jcloudcs.com
 *   OSS_REGION          - 区域，如 cn-north-1
 *   OSS_ACCESS_KEY_ID   - Access Key ID
 *   OSS_SECRET_ACCESS_KEY - Secret Access Key
 *   OSS_BUCKET          - 存储桶名称
 *   OSS_CDN_DOMAIN      - CDN 域名（可选，如 https://cdn.example.com）
 *   DATABASE_URL        - 数据库连接地址
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import "dotenv/config";

const ossEndpoint = process.env.OSS_ENDPOINT || "";
const s3 = new S3Client({
  region: process.env.OSS_REGION || "cn-north-1",
  endpoint: ossEndpoint.startsWith("http") ? ossEndpoint : `https://${ossEndpoint}`,
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.OSS_BUCKET || "";
const CDN_DOMAIN = process.env.OSS_CDN_DOMAIN || "";
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function getOssDomain(): string {
  if (CDN_DOMAIN) return CDN_DOMAIN;
  const endpoint = ossEndpoint.replace("https://", "").replace("http://", "");
  return `https://${BUCKET}.${endpoint}`;
}

// MIME 类型映射
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

async function uploadFile(localPath: string, ossKey: string): Promise<void> {
  const buffer = await readFile(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: ossKey,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

async function getAllFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function migrate() {
  console.log("=== 开始迁移本地文件到京东云 OSS ===\n");

  const domain = getOssDomain();

  // 检查 uploads 目录是否存在
  let localFiles: string[] = [];
  try {
    await stat(UPLOADS_DIR);
    localFiles = await getAllFiles(UPLOADS_DIR);
  } catch {
    console.log("uploads/ 目录不存在或为空，跳过文件上传步骤");
  }

  // 构建文件名 → OSS URL 的映射
  const urlMap = new Map<string, string>();

  if (localFiles.length > 0) {
    console.log(`找到 ${localFiles.length} 个本地文件，开始上传...\n`);

    for (const filePath of localFiles) {
      // 相对于 uploads/ 目录的路径作为 OSS key
      const relativePath = path.relative(UPLOADS_DIR, filePath);
      const ossKey = `uploads/${relativePath}`;
      const ossUrl = `${domain}/${ossKey}`;

      try {
        await uploadFile(filePath, ossKey);
        urlMap.set(`/api/files/${relativePath}`, ossUrl);
        console.log(`  ✓ ${relativePath} → ${ossUrl}`);
      } catch (err) {
        console.error(`  ✗ ${relativePath} 上传失败:`, err);
      }
    }
    console.log(`\n文件上传完成: ${urlMap.size}/${localFiles.length} 成功\n`);
  }

  // 初始化 Prisma（使用 libSQL adapter）
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  try {
    // 更新文章内容中的图片 URL
    const articles = await prisma.article.findMany();
    let articleUpdated = 0;

    for (const article of articles) {
      let content = article.content;
      let coverImage = article.coverImage;
      let changed = false;

      // 替换 content 中的旧 URL
      for (const [oldUrl, newUrl] of urlMap) {
        if (content.includes(oldUrl)) {
          content = content.replaceAll(oldUrl, newUrl);
          changed = true;
        }
      }
      // 也处理完整的域名形式（如 https://example.com/api/files/xxx）
      content = content.replace(
        new RegExp(`https?://[^/"]+/api/files/([\\w.-]+)`, "g"),
        (_match: string, filename: string) => {
          const mapped = urlMap.get(`/api/files/${filename}`);
          return mapped || _match;
        }
      );

      // 替换 coverImage
      if (coverImage && coverImage.includes("/api/files/")) {
        const filename = coverImage.split("/api/files/")[1];
        if (urlMap.has(`/api/files/${filename}`)) {
          coverImage = urlMap.get(`/api/files/${filename}`)!;
          changed = true;
        } else {
          // 尝试完整 URL 匹配
          const newUrl = coverImage.replace(
            /https?:\/\/[^/]+\/api\/files\/([\w.-]+)/,
            (_match: string, fname: string) => urlMap.get(`/api/files/${fname}`) || _match
          );
          if (newUrl !== coverImage) {
            coverImage = newUrl;
            changed = true;
          }
        }
      }

      if (changed) {
        await prisma.article.update({
          where: { id: article.id },
          data: { content, coverImage },
        });
        articleUpdated++;
        console.log(`  ✓ 更新文章 #${article.id}: ${article.title}`);
      }
    }

    // 更新 ArticleImage
    const images = await prisma.articleImage.findMany();
    let imageUpdated = 0;

    for (const img of images) {
      if (img.url.includes("/api/files/")) {
        const filename = img.url.split("/api/files/")[1];
        if (urlMap.has(`/api/files/${filename}`)) {
          await prisma.articleImage.update({
            where: { id: img.id },
            data: { url: urlMap.get(`/api/files/${filename}`) },
          });
          imageUpdated++;
        }
      }
    }
    if (imageUpdated > 0) {
      console.log(`  ✓ 更新 ${imageUpdated} 条 ArticleImage 记录`);
    }

    // 更新 Banner
    const banners = await prisma.banner.findMany();
    let bannerUpdated = 0;

    for (const banner of banners) {
      if (banner.imageUrl.includes("/api/files/")) {
        const filename = banner.imageUrl.split("/api/files/")[1];
        if (urlMap.has(`/api/files/${filename}`)) {
          await prisma.banner.update({
            where: { id: banner.id },
            data: { imageUrl: urlMap.get(`/api/files/${filename}`) },
          });
          bannerUpdated++;
        }
      }
    }
    if (bannerUpdated > 0) {
      console.log(`  ✓ 更新 ${bannerUpdated} 条 Banner 记录`);
    }

    // 更新 User avatarUrl
    const users = await prisma.user.findMany();
    let userUpdated = 0;

    for (const user of users) {
      if (user.avatarUrl.includes("/api/files/")) {
        const filename = user.avatarUrl.split("/api/files/")[1];
        if (urlMap.has(`/api/files/${filename}`)) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl: urlMap.get(`/api/files/${filename}`) },
          });
          userUpdated++;
        }
      }
    }
    if (userUpdated > 0) {
      console.log(`  ✓ 更新 ${userUpdated} 条 User 头像记录`);
    }

    console.log(`\n=== 迁移完成 ===`);
    console.log(`文件上传: ${urlMap.size}/${localFiles.length}`);
    console.log(`文章更新: ${articleUpdated}/${articles.length}`);
    console.log(`图片记录: ${imageUpdated}/${images.length}`);
    console.log(`轮播图: ${bannerUpdated}/${banners.length}`);
    console.log(`用户头像: ${userUpdated}/${users.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

migrate().catch((err) => {
  console.error("迁移失败:", err);
  process.exit(1);
});
