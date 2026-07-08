import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Add the hosts your product images are served from, e.g.:
      // { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
};

export default nextConfig;
