
import type { NextConfig } from "next";

const API_KEY = process.env.NEXT_PUBLIC_CULTURE_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_CULTURE_API_BASE_URL || 'http://apis.data.go.kr/B553457/cultureinfo';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  basePath: '/artfinder', // Global Base Path
  trailingSlash: true,
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined, // Only use export in production build
  images: {
    unoptimized: true,
  },
  // async rewrites() {
  //   return [];
  // },
};

export default nextConfig;
