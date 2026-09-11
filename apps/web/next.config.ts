import { config as loadEnv } from 'dotenv';
import type { NextConfig } from 'next';

// Monorepo: the shared .env lives at the workspace root (two levels above apps/web).
loadEnv({ path: '../../.env', quiet: true });

const nextConfig: NextConfig = {
  transpilePackages: ['@career-os/shared', '@career-os/db'],
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
