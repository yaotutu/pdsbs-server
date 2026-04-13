# 平顶山市帮颂商贸有限公司官网 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 pdsbs-server 项目中添加企业官网首页，用于域名备案。

**Architecture:** 单页滚动官网，作为服务端组件直接替换根路径的 redirect。6 个区块：导航栏、Hero、公司简介、业务范围、联系我们、页脚。纯静态页面，不涉及 API 或数据库。

**Tech Stack:** Next.js 16 App Router、Tailwind CSS 4、Lucide React 图标、Server Component

**Spec:** `docs/superpowers/specs/2026-04-13-company-website-design.md`

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `src/app/globals.css` | 添加 smooth scroll |
| 修改 | `src/app/layout.tsx` | 更新 title/description 元数据 |
| 重写 | `src/app/page.tsx` | 替换 redirect 为官网首页组件 |

所有官网内容集中在 `page.tsx` 一个文件中，因为它是纯展示的服务端组件，无需拆分。

---

### Task 1: 添加 smooth scroll 样式

**Files:**
- Modify: `src/app/globals.css:126`（在 `html { @apply font-sans; }` 后面添加）

- [ ] **Step 1: 在 globals.css 中添加 smooth scroll**

在 `@layer base` 块内的 `html` 规则中添加 `scroll-behavior: smooth`：

```css
  html {
    @apply font-sans;
    scroll-behavior: smooth;
  }
```

- [ ] **Step 2: 提交**

```bash
git add src/app/globals.css
git commit -m "style: 添加 smooth scroll 支持官网锚点导航"
```

---

### Task 2: 更新根布局元数据

**Files:**
- Modify: `src/app/layout.tsx:5-8`

- [ ] **Step 1: 修改 metadata 的 title 和 description**

将 `src/app/layout.tsx` 中的 metadata 改为：

```ts
export const metadata: Metadata = {
  title: "平顶山市帮颂商贸有限公司",
  description: "平顶山市帮颂商贸有限公司 - 专注电子产品与人工智能硬件销售，为您提供优质的产品与服务",
};
```

- [ ] **Step 2: 提交**

```bash
git add src/app/layout.tsx
git commit -m "chore: 更新网站标题和描述为公司名称"
```

---

### Task 3: 实现官网首页

**Files:**
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: 重写 page.tsx 为官网首页**

完整替换 `src/app/page.tsx` 的内容为：

```tsx
import {
  Smartphone,
  Cpu,
  Printer,
  Radio,
  ShoppingBag,
  Globe,
  Building2,
  Phone,
  MapPin,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

/* ========== 业务范围卡片数据 ========== */
const businessItems = [
  {
    icon: Smartphone,
    title: "电子产品销售",
    description: "提供各类消费电子产品，品质保证，价格合理",
  },
  {
    icon: Cpu,
    title: "人工智能硬件",
    description: "AI 芯片、智能终端等前沿硬件产品销售",
  },
  {
    icon: Printer,
    title: "办公设备",
    description: "打印机、复印机等办公设备，助力企业高效运营",
  },
  {
    icon: Radio,
    title: "通讯设备",
    description: "通讯设备及配件销售，保障信息畅通",
  },
  {
    icon: ShoppingBag,
    title: "日用百货",
    description: "精选日用百货商品，满足日常生活所需",
  },
  {
    icon: Globe,
    title: "网络技术服务",
    description: "专业的网络技术咨询与信息系统集成服务",
  },
];

/* ========== 导航栏 ========== */
function Navbar() {
  const navLinks = [
    { href: "#about", label: "公司简介" },
    { href: "#business", label: "业务范围" },
    { href: "#contact", label: "联系我们" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 公司名 */}
          <a href="#" className="text-lg font-bold text-gray-900 truncate">
            帮颂商贸
          </a>

          {/* 桌面端导航 */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* 手机端菜单按钮（纯 CSS 实现） */}
          <label className="sm:hidden cursor-pointer" htmlFor="mobile-menu-toggle">
            <Menu className="w-6 h-6 text-gray-600" />
          </label>
        </div>
      </div>

      {/* 手机端下拉菜单 */}
      <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
      <div className="sm:hidden hidden peer-checked:block border-t border-gray-100 bg-white">
        <div className="px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <label key={link.href} htmlFor="mobile-menu-toggle">
              <a
                href={link.href}
                className="block py-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
              >
                {link.label}
              </a>
            </label>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ========== Hero 区块 ========== */
function Hero() {
  return (
    <section className="relative pt-16 flex items-center justify-center min-h-[80vh] bg-gradient-to-b from-teal-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          平顶山市帮颂商贸有限公司
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          专注电子产品与人工智能硬件销售，为您提供优质的产品与服务
        </p>
        <a
          href="#business"
          className="inline-flex items-center gap-2 mt-10 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          了解更多
          <ChevronDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

/* ========== 公司简介 ========== */
function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
          关于我们
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
          {/* 文字区 */}
          <div className="md:col-span-3">
            <p className="text-gray-600 leading-relaxed text-base">
              平顶山市帮颂商贸有限公司成立于河南省平顶山市，是一家专注于电子产品销售、人工智能硬件、办公设备及通讯设备销售的综合性商贸企业。公司秉承&ldquo;诚信经营、服务至上&rdquo;的理念，致力于为客户提供优质的产品与专业的技术服务。
            </p>
            <p className="text-gray-600 leading-relaxed text-base mt-4">
              经营范围涵盖电子产品、人工智能硬件、办公设备、通讯设备、日用百货等多个领域，同时提供网络技术服务与信息系统集成服务，满足不同客户的多样化需求。
            </p>
          </div>
          {/* 装饰图标 */}
          <div className="md:col-span-2 flex justify-center">
            <div className="w-40 h-40 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Building2 className="w-20 h-20 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== 业务范围 ========== */
function Business() {
  return (
    <section id="business" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
          业务范围
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessItems.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== 联系我们 ========== */
function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
          联系我们
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* 电话 */}
          <a
            href="tel:15637520333"
            className="flex flex-col items-center gap-3 p-8 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <Phone className="w-7 h-7 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500">联系电话</span>
            <span className="text-lg font-semibold text-gray-900">
              15637520333
            </span>
          </a>
          {/* 地址 */}
          <div className="flex flex-col items-center gap-3 p-8 rounded-xl bg-gray-50">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500">公司地址</span>
            <span className="text-base font-semibold text-gray-900 text-center">
              河南省平顶山市卫东区
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== 页脚 ========== */
function Footer() {
  return (
    <footer className="py-8 bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm space-y-2">
        <p>&copy; 2026 平顶山市帮颂商贸有限公司 版权所有</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            豫ICP备XXXXXXXX号
          </a>
          <span className="hidden sm:inline">|</span>
          <a
            href="http://www.beian.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            豫公网安备 XXXXXXXXXXXXX号
          </a>
        </div>
        <a
          href="/admin"
          className="inline-block mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          管理后台
        </a>
      </div>
    </footer>
  );
}

/* ========== 首页 ========== */
export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Business />
      <Contact />
      <Footer />
    </main>
  );
}
```

> **说明：**
> - 导航栏使用纯 CSS checkbox hack 实现手机端菜单，无需客户端组件
> - `&ldquo;` / `&rdquo;` 是 JSX 中中文引号的标准写法
> - 整个页面是服务端组件，零客户端 JS 开销
> - 备案号为占位符，后续替换为真实号码

- [ ] **Step 2: 验证开发服务器启动正常**

Run: `npm run dev`
Expected: 无报错，控制台显示 `Ready in` 信息

- [ ] **Step 3: 浏览器验证**

在浏览器中检查：
1. `http://localhost:3000/` 显示官网首页（不再重定向）
2. 导航栏锚点跳转平滑
3. 手机端菜单可展开/收起
4. `http://localhost:3000/admin` 正常跳转到登录页
5. 页脚管理后台链接跳转正常

- [ ] **Step 4: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: 添加平顶山市帮颂商贸有限公司官网首页"
```

---

## 验证清单

- [ ] `npm run build` 构建成功
- [ ] `/` 展示官网首页
- [ ] `/admin` 正常进入管理后台
- [ ] 锚点导航平滑滚动
- [ ] 手机端响应式布局正常
- [ ] 电话卡片手机端可点击拨号
- [ ] 页脚备案链接可跳转
