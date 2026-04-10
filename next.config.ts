import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "localhost" }],
  },
  allowedDevOrigins: ["192.168.55.182", "192.168.123.212"],
  // TinyMCE 自托管模式需要转译
  transpilePackages: ["tinymce"],
};

export default nextConfig;
