/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: ['ishkkozdnhhibcxlnvgc.supabase.co'],
  },
  serverActions: {
    allowedOrigins: ['*'],
  },
  experimental: {
    serverActions: true,
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
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: '.next',
  outDir: 'out',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
