import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ảnh công thức được phục vụ bởi .NET API (static files trong wwwroot).
  // Phải khớp AppSettings:BaseUrl trong appsettings.json (hiện là :5041),
  // nếu không next/image sẽ báo "hostname localhost is not configured".
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5041' },
      { protocol: 'https', hostname: 'localhost', port: '7053' },
    ],
  },
};

export default nextConfig;
