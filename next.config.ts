// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
    ],
    formats: ['image/webp'],
  },

  // Remove eslint, remove turbo from experimental
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

};

export default nextConfig;