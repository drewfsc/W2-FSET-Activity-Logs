/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed basePath and assetPrefix - this app runs independently
  eslint: {
    // Temporarily ignore ESLint during builds due to deprecated options warning
    // Can be re-enabled after ESLint config is updated
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ensure type checking happens during builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
