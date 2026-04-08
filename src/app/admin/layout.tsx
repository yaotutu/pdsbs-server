"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Button, theme } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ReadOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/admin", icon: <DashboardOutlined />, label: "仪表盘" },
  { key: "/admin/articles", icon: <FileTextOutlined />, label: "文章管理" },
  { key: "/admin/categories", icon: <AppstoreOutlined />, label: "分类管理" },
  { key: "/admin/read-logs", icon: <ReadOutlined />, label: "阅读记录" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
            lineHeight: "32px",
          }}
        >
          {collapsed ? "医美" : "医美案例管理"}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
