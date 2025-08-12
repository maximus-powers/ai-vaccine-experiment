import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'colab.research.google.com',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io',
      },
    ],
  },
};

export default nextConfig;
