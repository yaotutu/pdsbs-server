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
  ChevronRight,
  Menu,
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

/* ========== 导航栏（Apple 风格玻璃导航） ========== */
function Navbar() {
  const navLinks = [
    { href: "#about", label: "公司简介" },
    { href: "#business", label: "业务范围" },
    { href: "#contact", label: "联系我们" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 sm:px-6 lg:px-8"
      style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "saturate(180%) blur(20px)" }}
    >
      <div className="max-w-[980px] w-full mx-auto flex items-center justify-between">
        {/* 公司名 */}
        <a href="#" className="text-white font-semibold" style={{ fontSize: "14px", letterSpacing: "-0.224px" }}>
          帮颂商贸
        </a>

        {/* 桌面端导航 */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[rgba(255,255,255,0.8)] hover:text-white transition-colors"
              style={{ fontSize: "12px" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* 手机端菜单按钮 */}
        <label className="sm:hidden cursor-pointer" htmlFor="mobile-menu-toggle">
          <Menu className="w-5 h-5 text-white" />
        </label>
      </div>

      {/* 手机端下拉菜单 */}
      <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
      <div
        className="sm:hidden hidden peer-checked:block absolute top-12 left-0 right-0"
        style={{ background: "rgba(0, 0, 0, 0.9)", backdropFilter: "saturate(180%) blur(20px)" }}
      >
        <div className="px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <label key={link.href} htmlFor="mobile-menu-toggle">
              <a
                href={link.href}
                className="block py-2 text-[rgba(255,255,255,0.8)] hover:text-white transition-colors"
                style={{ fontSize: "14px" }}
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

/* ========== Hero 区块（白色背景 + 深色标题） ========== */
function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center" style={{ background: "#fff" }}>
      <h1
        className="font-semibold leading-[1.07]"
        style={{ fontSize: "clamp(28px, 5vw, 56px)", color: "#1d1d1f", letterSpacing: "-0.28px" }}
      >
        平顶山市帮颂商贸有限公司
      </h1>
      <p
        className="mt-4 max-w-2xl leading-[1.47]"
        style={{ fontSize: "21px", color: "rgba(0, 0, 0, 0.8)", letterSpacing: "0.231px" }}
      >
        专注电子产品与人工智能硬件销售
        <br />
        为您提供优质的产品与服务
      </p>
      <a
        href="#business"
        className="mt-8 inline-flex items-center gap-1 text-white font-normal transition-colors"
        style={{
          fontSize: "17px",
          background: "#0071e3",
          padding: "8px 15px",
          borderRadius: "980px",
        }}
      >
        了解更多
        <ChevronRight className="w-4 h-4" />
      </a>
    </section>
  );
}

/* ========== 公司简介（浅灰背景） ========== */
function About() {
  return (
    <section id="about" className="py-24 px-4" style={{ background: "#f5f5f7" }}>
      <div className="max-w-[980px] mx-auto">
        <h2
          className="text-center font-semibold mb-16"
          style={{ fontSize: "40px", color: "#1d1d1f", lineHeight: 1.1 }}
        >
          关于我们
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* 文字区 */}
          <div className="flex-1">
            <p
              className="leading-[1.47]"
              style={{ fontSize: "17px", color: "rgba(0, 0, 0, 0.8)", letterSpacing: "-0.374px" }}
            >
              平顶山市帮颂商贸有限公司成立于河南省平顶山市，是一家专注于电子产品销售、人工智能硬件、办公设备及通讯设备销售的综合性商贸企业。公司秉承&ldquo;诚信经营、服务至上&rdquo;的理念，致力于为客户提供优质的产品与专业的技术服务。
            </p>
            <p
              className="mt-6 leading-[1.47]"
              style={{ fontSize: "17px", color: "rgba(0, 0, 0, 0.8)", letterSpacing: "-0.374px" }}
            >
              经营范围涵盖电子产品、人工智能硬件、办公设备、通讯设备、日用百货等多个领域，同时提供网络技术服务与信息系统集成服务，满足不同客户的多样化需求。
            </p>
          </div>
          {/* 装饰图标 */}
          <div className="flex-shrink-0">
            <div
              className="flex items-center justify-center"
              style={{ width: "160px", height: "160px", borderRadius: "12px", background: "#e8e8ed" }}
            >
              <Building2 style={{ width: "80px", height: "80px", color: "#1d1d1f" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== 业务范围（白色背景 + 浅灰卡片） ========== */
function Business() {
  return (
    <section id="business" className="py-24 px-4" style={{ background: "#fff" }}>
      <div className="max-w-[980px] mx-auto">
        <h2
          className="text-center font-semibold mb-16"
          style={{ fontSize: "40px", color: "#1d1d1f", lineHeight: 1.1 }}
        >
          业务范围
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {businessItems.map((item) => (
            <div
              key={item.title}
              className="p-6"
              style={{ background: "#f5f5f7", borderRadius: "12px" }}
            >
              <div
                className="flex items-center justify-center mb-5"
                style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#e8e8ed" }}
              >
                <item.icon style={{ width: "24px", height: "24px", color: "#0071e3" }} />
              </div>
              <h3
                className="font-bold mb-2"
                style={{ fontSize: "21px", color: "#1d1d1f", lineHeight: 1.19, letterSpacing: "0.231px" }}
              >
                {item.title}
              </h3>
              <p
                className="leading-[1.47]"
                style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.48)", letterSpacing: "-0.224px" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== 联系我们（浅灰背景） ========== */
function Contact() {
  return (
    <section id="contact" className="py-24 px-4" style={{ background: "#f5f5f7" }}>
      <div className="max-w-[980px] mx-auto">
        <h2
          className="text-center font-semibold mb-16"
          style={{ fontSize: "40px", color: "#1d1d1f", lineHeight: 1.1 }}
        >
          联系我们
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[680px] mx-auto">
          {/* 电话 */}
          <a
            href="tel:15637520333"
            className="flex flex-col items-center gap-3 p-8 transition-colors"
            style={{ background: "#e8e8ed", borderRadius: "12px" }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1d1d1f" }}
            >
              <Phone style={{ width: "24px", height: "24px", color: "#fff" }} />
            </div>
            <span style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.48)" }}>联系电话</span>
            <span className="font-semibold" style={{ fontSize: "17px", color: "#1d1d1f" }}>
              15637520333
            </span>
          </a>
          {/* 地址 */}
          <div
            className="flex flex-col items-center gap-3 p-8"
            style={{ background: "#e8e8ed", borderRadius: "12px" }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1d1d1f" }}
            >
              <MapPin style={{ width: "24px", height: "24px", color: "#fff" }} />
            </div>
            <span style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.48)" }}>公司地址</span>
            <span className="font-semibold text-center" style={{ fontSize: "17px", color: "#1d1d1f" }}>
              河南省平顶山市卫东区
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== 页脚（纯黑背景） ========== */
function Footer() {
  return (
    <footer className="bg-black py-8 px-4" style={{ color: "rgba(255, 255, 255, 0.56)" }}>
      <div className="max-w-[980px] mx-auto text-center" style={{ fontSize: "12px", lineHeight: 1.33, letterSpacing: "-0.12px" }}>
        <p>&copy; 2026 平顶山市帮颂商贸有限公司 版权所有</p>
        <div className="mt-2">
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[rgba(255,255,255,0.8)] transition-colors"
          >
            豫ICP备2026013295号
          </a>
        </div>
        <a
          href="/admin"
          className="inline-block mt-4 hover:text-[rgba(255,255,255,0.8)] transition-colors"
          style={{ fontSize: "10px" }}
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
    <main style={{ fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <Navbar />
      <Hero />
      <About />
      <Business />
      <Contact />
      <Footer />
    </main>
  );
}
