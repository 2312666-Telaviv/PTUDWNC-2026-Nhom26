import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ảnh công thức được phục vụ bởi .NET API ở cổng 5001
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost', port: '5001' },
      { protocol: 'http', hostname: 'localhost', port: '5001' },
    ],
  },
};

export default nextConfig;
