<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 重要规则
- 禁止私自提交commit
- 数据库统一通过 `DATABASE_URL` 配置，默认文件为 `pdsbs.db`
- 线上数据库结构变更必须使用 `npm run db:migrate`
- 危险数据库脚本 `db:push`、`db:seed`、`db:reset` 已删除，不要恢复它们
