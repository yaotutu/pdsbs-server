# pdsbs-server

医美案例新闻内容管理系统，包含管理后台（Web）和微信小程序客户端。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| 数据库 | SQLite (LibSQL) |
| ORM | Prisma 7 |
| UI | shadcn/ui、Tailwind CSS 4 |
| 富文本 | TinyMCE（自托管） |
| 认证 | JWT |

## 本地开发

```bash
# 安装依赖
npm install

# 初始化数据库并填充种子数据（首次运行）
npm run db:seed

# 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:3000`，管理后台访问 `/admin`。

默认管理员账号：`admin` / `admin123`

## 服务器部署

### 1. 环境要求

- Node.js 20+
- npm
- Git

### 2. 拉取代码

```bash
git clone git@github.com:yaotutu/pdsbs-server.git
cd pdsbs-server
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入实际配置：

```env
DATABASE_URL=file:./dev.db
JWT_SECRET=你的JWT密钥
WX_APPID=你的微信小程序AppID
WX_SECRET=你的微信小程序Secret
APP_URL=http://你的服务器公网地址:端口
```

> `APP_URL` 用于给小程序端返回完整的图片地址，必须配置为服务器的公网可访问地址。

### 4. 安装、构建、初始化

```bash
npm install
npm run build
npm run db:seed
```

### 5. 启动服务

推荐使用 [PM2](https://pm2.keymetrics.io/) 守护进程：

```bash
npm install -g pm2
pm2 start npm --name "pdsbs" -- start
pm2 save
pm2 startup
```

常用 PM2 命令：

```bash
pm2 status          # 查看状态
pm2 logs pdsbs      # 查看日志
pm2 restart pdsbs   # 重启服务
pm2 stop pdsbs      # 停止服务
```

### 6. Nginx 反向代理（推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 7. 更新部署

```bash
cd pdsbs-server
git pull
npm install
npm run build
pm2 restart pdsbs
```

如果数据库结构有变更：

```bash
npm run db:push
```

### 8. 数据备份

以下内容需要定期备份：

- `dev.db` — SQLite 数据库文件
- `public/uploads/` — 用户上传的图片资源

```bash
# 备份示例
cp dev.db backup/dev-$(date +%Y%m%d).db
tar czf backup/uploads-$(date +%Y%m%d).tar.gz public/uploads/
```

## 项目结构

```
src/
  app/
    admin/          # 管理后台页面（文章、分类、轮播图、阅读记录）
    api/            # RESTful API
      admin/        # 管理端接口（需管理员权限）
      articles/     # 文章接口
      categories/   # 分类接口
      banners/      # 轮播图接口（公开）
      upload/       # 文件上传
      wx/login/     # 微信登录
  components/
    ui/             # shadcn/ui 组件
    editor/         # TinyMCE 富文本编辑器
  lib/
    prisma.ts       # 数据库连接（LibSQL 适配器）
    auth.ts         # JWT 认证
    response.ts     # 统一响应格式
    url.ts          # 图片地址处理
  proxy.ts          # 中间件（认证守卫）
prisma/
  schema.prisma     # 数据库模型
  seed.ts           # 种子数据
```

## API 响应格式

所有接口统一返回：

```json
{ "code": 0, "message": "ok", "data": {} }
```

- `code: 0` 表示成功
- `code: -1` 表示失败，具体原因见 `message`
