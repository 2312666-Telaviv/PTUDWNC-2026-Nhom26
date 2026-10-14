import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos", // thay bằng hostname ở Bước 1
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "7053",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;