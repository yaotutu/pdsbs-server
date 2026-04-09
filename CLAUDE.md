@AGENTS.md

# 项目概览

医美案例新闻内容管理系统（pdsbs-server），包含两个终端：
1. **管理后台** — Web 端 CMS，管理文章、分类、查看阅读统计
2. **微信小程序客户端** — 通过 API 获取文章列表和阅读

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| 数据库 | SQLite (better-sqlite3) |
| ORM | Prisma 7 (adapter 模式) |
| UI | shadcn/ui (base-nova 风格)、Lucide React 图标 |
| 样式 | Tailwind CSS 4 |
| 认证 | JWT (jsonwebtoken + jose) |
| 密码 | bcryptjs |
| 通知 | Sonner |

## 目录结构

```
src/
  proxy.ts                  # Next.js 中间件（Edge 兼容的认证守卫）
  lib/
    prisma.ts               # Prisma 单例（globalThis 缓存防热重载连接池耗尽）
    auth.ts                 # JWT 签发/验证（jsonwebtoken + jose for Edge）
    response.ts             # 统一 JSON 响应: { code, message, data }
    wx.ts                   # 微信小程序 code2Session 登录
    utils.ts                # Tailwind cn() 工具
  components/ui/            # shadcn/ui 组件库
  app/
    admin/                  # 管理后台页面（均为客户端组件）
      login/                # 登录页
      articles/             # 文章列表 + 编辑（edit/[id]）
      categories/           # 分类管理
      read-logs/            # 阅读日志
    api/                    # RESTful API 路由
      admin/                # 登录、统计
      articles/             # 文章 CRUD + 阅读记录
      categories/           # 分类 CRUD
      upload/               # 文件上传（存入 public/uploads/）
      wx/login/             # 微信登录
  generated/prisma/         # Prisma 生成客户端（gitignored）
prisma/
  schema.prisma             # 数据库模型（User, Category, Article, ArticleImage, ReadLog）
  seed.ts                   # 种子数据（默认管理员 + 10 个医美分类）
```

## 数据库模型

- **User** — openid（管理员用 username）、role（user/admin）、password（bcrypt）
- **Category** — name、sortOrder、isActive
- **Article** — title、content、summary、coverImage、viewCount、status（draft/published）
- **ArticleImage** — url、sortOrder，级联删除
- **ReadLog** — readAt、duration、ip

## 架构要点

- **中间件认证**：`src/proxy.ts` 使用 Edge 兼容的 jose 验证 JWT，保护 `/admin/*` 页面和阅读记录 API
- **双重 Token 存储**：管理员 token 同时存 localStorage（API 调用）和 cookie（中间件读取）
- **统一响应格式**：所有 API 返回 `{ code, message, data }`，`code: 0` 表示成功
- **文件上传**：直接存磁盘 `public/uploads/`，使用时间戳+随机数命名
- **Prisma 单例模式**：开发环境下通过 globalThis 缓存避免热重载连接池耗尽
- **管理后台全客户端渲染**：所有 admin 页面都是 `"use client"`，通过 useEffect 调用 API

## 开发命令

- `npm run dev` — 启动开发服务器
- `npm run db:seed` — 推送 schema 并填充种子数据
- `npm run db:reset` — 重置数据库并重新填充
- `npm run build` — 构建生产版本

## 编码规范

- 优先使用函数式编程范式
- 添加详细的中文注释
- API 路由使用统一响应格式（response.ts 中的 success/error/unauthorized）
- Prisma 客户端通过 `src/lib/prisma.ts` 导入，不要直接实例化
