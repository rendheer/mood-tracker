/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ishkkozdnhhibcxlnvgc.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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
  // Enable CSS modules and imports
  experimental: {
    optimizeCss: true,
    optimizeFonts: true,
  },
}

module.exports = nextConfig
