import type { MetadataRoute } from "next";
import { getAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES = [
  "",
  "/properties",
  "/shortlets",
  "/about",
  "/contact",
  "/insights",
  "/faq",
  "/professional-services",
  "/privacy-policy",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/properties" ? 0.9 : 0.7,
  }));

  try {
    const firstPage = await getAvailablePropertiesServer({
      page: 1,
      limit: 100,
    });
    const remainingPages = await Promise.all(
      Array.from(
        { length: Math.max(0, firstPage.pagination.pages - 1) },
        (_, index) =>
          getAvailablePropertiesServer({ page: index + 2, limit: 100 }),
      ),
    );
    const properties = [
      ...firstPage.properties,
      ...remainingPages.flatMap((page) => page.properties),
    ];

    return [
      ...staticEntries,
      ...properties.map((property) => ({
        url: `${SITE_URL}/properties/${property.id}`,
        lastModified: property.updatedAt ?? property.createdAt,
        changeFrequency: "weekly" as const,
        priority: property.isFeatured ? 0.9 : 0.8,
        images: property.images.slice(0, 5),
      })),
    ];
  } catch {
    return staticEntries;
  }
}
