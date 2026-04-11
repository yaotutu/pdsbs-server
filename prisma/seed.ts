import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 创建默认管理员
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { openid: "admin" },
    update: {},
    create: {
      openid: "admin",
      nickname: "管理员",
      role: "admin",
      password: hashedPassword,
    },
  });

  // 创建默认分类
  const categories = [
    { name: "口腔", sortOrder: 1 },
    { name: "植发", sortOrder: 2 },
    { name: "鼻部", sortOrder: 3 },
    { name: "眼部", sortOrder: 4 },
    { name: "隆胸", sortOrder: 5 },
    { name: "脂肪", sortOrder: 6 },
    { name: "面部", sortOrder: 7 },
    { name: "针剂项目", sortOrder: 8 },
    { name: "皮肤管理", sortOrder: 9 },
    { name: "面部轮廓", sortOrder: 10 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.sortOrder },
      update: {},
      create: cat,
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
