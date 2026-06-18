import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "积分商店",
  description: "为村庄服务的积分兑换平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
