import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // ← 加上这一行，开启静态导出
  images: {
    unoptimized: true,  // ← 加上这一行，支持图片
  },
};

export default nextConfig;