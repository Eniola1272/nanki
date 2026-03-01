// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable React Strict Mode for better development practices
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google Avatars
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // For GitHub Avatars
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // For any stock images
        pathname: '**',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },

  // Configure redirects if needed
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true, // 301 redirect
      },
      {
        source: '/dashboard',
        destination: '/dashboard/quizzes',
        permanent: false, // 307 redirect
      },
    ];
  },

  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configure environment variables that should be available on client
  env: {
    // Add any public environment variables here
    NEXT_PUBLIC_APP_NAME: 'Quiz App',
  },

  // Experimental features (use with caution)
  experimental: {
    // Optimize server components
    optimizeServerReact: true,
    
    // Enable turbopack for development (faster)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    
    // Improve bundling
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Configure webpack for custom needs
  webpack: (config, { isServer, dev }) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize bundle size
    if (!dev && !isServer) {
      // Replace React with Preact in production? (optional)
      // Object.assign(config.resolve.alias, {
      //   'react': 'preact/compat',
      //   'react-dom': 'preact/compat',
      // });
    }

    return config;
  },

  // Enable compression
  compress: true,

  // Configure build output
  output: 'standalone', // For better Docker support

  // Configure trailing slashes
  trailingSlash: false,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Configure dist directory
  distDir: '.next',

  // Enable HTTP/2
  httpAgentOptions: {
    keepAlive: true,
  },

  // Configure logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Type checking options
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false, // Set to false to enforce type checking
  },

  // ESLint options
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false, // Set to false to enforce linting
  },

  // Configure bundle analyzer (uncomment when needed)
  // if (process.env.ANALYZE === 'true') {
  //   const withBundleAnalyzer = require('@next/bundle-analyzer')({
  //     enabled: true,
  //   });
  //   module.exports = withBundleAnalyzer(module.exports);
  // }
};

export default nextConfig;