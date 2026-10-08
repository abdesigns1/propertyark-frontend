import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/buyer/",
        "/vendor/",
        "/auth/",
        "/payment/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
