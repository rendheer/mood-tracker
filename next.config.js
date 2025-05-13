/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Ensure environment variables are available at build time
  env: {
    NEXT_PUBLIC_BETA_MODE: process.env.NEXT_PUBLIC_BETA_MODE || 'false',
  },
  
  // Configure image optimization
  images: {
    domains: ['ishkkozdnhhibcxlnvgc.supabase.co'],
    unoptimized: true, // Disable default Image Optimization API for Netlify
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };
    
    return config;
  },
  
  // Output directory
  distDir: '.next',
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Disable ESLint during build (handled by Netlify)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during build (handled by Netlify)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
