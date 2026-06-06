/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: 'output: export' removed for production deployment.
  // API routes (Stripe webhooks, checkout sessions) require a Node.js server.
  // Deploy to Vercel/Railway/DigitalOcean App Platform for full Next.js support.
  distDir: '.next',
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
