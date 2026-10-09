/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Painel e API: nunca indexar, mesmo se o link vazar.
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // Imagens estáticas versionadas por nome: cache longo.
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
}

export default nextConfig
