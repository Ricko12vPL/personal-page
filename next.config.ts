import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
  async redirects() {
    return [
      {
        // One canonical host: www serves a duplicate of the site otherwise.
        source: '/:path*',
        has: [{ type: 'host', value: 'www.kacpersaks.dev' }],
        destination: 'https://kacpersaks.dev/:path*',
        permanent: true,
      },
      {
        source: '/projects/validation-crisis',
        destination: '/research/validation-crisis',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

class VeliteWebpackPlugin {
  static started = false
  apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.constructor.name === 'Compiler'
      const { build } = await import('velite')
      await build({ watch: dev, clean: !dev })
    })
  }
}

export default nextConfig
