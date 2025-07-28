import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true // Para evitar problemas con blob URLs
  }
};

export default nextConfig;
