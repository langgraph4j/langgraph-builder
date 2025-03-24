/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  webpack(config) {
    return config
  },
  poweredByHeader: false,
  generateEtags: false,
  reactStrictMode: true,
  swcMinify: true,
}
