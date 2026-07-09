import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    unoptimized: true
  },
  allowedDevOrigins: ['192.168.56.1']
};

export default nextConfig;
