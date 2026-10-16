import type { NextConfig } from "next";

function backendImagePattern() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) return [];

  try {
    const backend = new URL(apiBaseUrl);
    if (!["http:", "https:"].includes(backend.protocol)) return [];
    return [
      {
        protocol: backend.protocol.slice(0, -1) as "http" | "https",
        hostname: backend.hostname,
        port: backend.port,
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    // Property uploads use unique, timestamped filenames. Keep their generated
    // responsive variants cached so repeat visits do not wake the media origin.
    minimumCacheTTL: 2_678_400,
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
      ...backendImagePattern(),
    ],
  },
  /* config options here */
};

export default nextConfig;
