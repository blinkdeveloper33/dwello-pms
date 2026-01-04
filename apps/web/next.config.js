/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@loomi/shared', '@loomi/ui'],
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4001',
  },
};

module.exports = nextConfig;

