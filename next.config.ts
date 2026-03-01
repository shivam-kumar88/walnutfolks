import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com', // or the specific bucket hostname
        port: '',
        pathname: '/**',
      },
    ],
    }
  }

export default nextConfig;
