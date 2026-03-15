import type { NextConfig } from "next";

const IS_PROD = process.env.NODE_ENV === 'production';

// 개발 환경 전용 보안 헤더 (프로덕션은 Cafe24 정적 서버 → .htaccess 에서 관리)
const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: '/artfinder',
  trailingSlash: true,
  output: IS_PROD ? 'export' : undefined,
  images: { unoptimized: true },

  ...(!IS_PROD && {
    async headers() {
      return [{ source: '/(.*)', headers: securityHeaders }];
    },
  }),
};

export default nextConfig;
