import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {},
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85],
  },
}