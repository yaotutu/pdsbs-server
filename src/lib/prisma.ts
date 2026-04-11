import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// 本地 SQLite 数据库文件路径
const dbPath = path.join(process.cwd(), "dev.db");

// 使用 LibSQL 适配器（纯 JS/WASM，无需编译原生模块）
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

// 开发环境下通过 globalThis 缓存，避免热重载时连接池耗尽
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
