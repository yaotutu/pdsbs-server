import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 清空所有业务数据（按外键依赖顺序）
  await prisma.readLog.deleteMany();
  await prisma.articleImage.deleteMany();
  await prisma.article.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.category.deleteMany();

  // 重置自增 ID
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");

  // 创建默认管理员
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { openid: "admin" },
    update: { password: hashedPassword },
    create: {
      openid: "admin",
      nickname: "管理员",
      role: "admin",
      password: hashedPassword,
    },
  });

  console.log("数据库已重置，仅保留管理员账户");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
