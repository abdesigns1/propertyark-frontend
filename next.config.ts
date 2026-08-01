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
      {
        protocol: "https",
        hostname: "propertyark-backend.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
