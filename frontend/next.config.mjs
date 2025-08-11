/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // If you don't plan to use Next's <Image /> optimization,
  // keep this true so no /_next/image function is needed.
  images: { unoptimized: true },

  // CI friendliness (optional)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
