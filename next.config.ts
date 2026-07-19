import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      { protocol: "https", hostname: "flagcdn.com" },
      {
        protocol: "https",
        hostname: "img.magnific.com",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
