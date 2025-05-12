/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: ['ishkkozdnhhibcxlnvgc.supabase.co'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
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
}

module.exports = nextConfig
