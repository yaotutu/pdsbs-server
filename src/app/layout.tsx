import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "平顶山市帮颂商贸有限公司",
  description:
    "平顶山市帮颂商贸有限公司 - 专注电子产品与人工智能硬件销售，为您提供优质的产品与服务",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
