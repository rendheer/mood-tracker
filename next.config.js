/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // This will make sure the environment variables are available at build time
    NEXT_PUBLIC_BETA_MODE: process.env.NEXT_PUBLIC_BETA_MODE || 'false',
  },
  images: {
    domains: ['ishkkozdnhhibcxlnvgc.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  distDir: '.next',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/api/:path*',
      },
    ];
  },
  experimental: {
    optimizeCss: true,
  },
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
