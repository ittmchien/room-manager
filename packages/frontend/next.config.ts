import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@room-manager/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
};

export default nextConfig;
