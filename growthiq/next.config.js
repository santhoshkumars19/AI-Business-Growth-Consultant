/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: false,
  },
};

module.exports = nextConfig;
