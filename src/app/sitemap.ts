import type { MetadataRoute } from "next";
import { getAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import { getPublishedBlogPosts } from "@/features/blog/server/blog-content";
import {
  getActivePropertySeoLandings,
  propertySeoLandingPath,
} from "@/features/properties/seo/property-seo-landings";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES = [
  "",
  "/properties",
  "/shortlets",
  "/about",
  "/contact",
  "/insights",
  "/blog",
  "/locations",
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

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedBlogPosts();
    blogEntries = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [new URL(post.featuredImage, SITE_URL).href],
    }));
  } catch {
    // Keep the public sitemap available if an unpublished article is malformed.
  }

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
    const publicVendors = new Map<string, string>();
    const propertySeoLandings = getActivePropertySeoLandings(properties);

    for (const property of properties) {
      if (!property.vendorId) continue;

      const modifiedAt = property.updatedAt ?? property.createdAt;
      const currentModifiedAt = publicVendors.get(property.vendorId);
      if (
        !currentModifiedAt ||
        Date.parse(modifiedAt) > Date.parse(currentModifiedAt)
      ) {
        publicVendors.set(property.vendorId, modifiedAt);
      }
    }

    return [
      ...staticEntries,
      ...blogEntries,
      ...propertySeoLandings.map((landing) => ({
        url: `${SITE_URL}${propertySeoLandingPath(landing.location, landing.intent)}`,
        lastModified: landing.properties.reduce((latest, property) => {
          const modifiedAt = property.updatedAt ?? property.createdAt;
          return Date.parse(modifiedAt) > Date.parse(latest)
            ? modifiedAt
            : latest;
        }, landing.properties[0].updatedAt ?? landing.properties[0].createdAt),
        changeFrequency: "daily" as const,
        priority: 0.8,
        images: landing.properties
          .flatMap((property) => property.images)
          .slice(0, 5),
      })),
      ...properties.map((property) => ({
        url: `${SITE_URL}/properties/${property.id}`,
        lastModified: property.updatedAt ?? property.createdAt,
        changeFrequency: "weekly" as const,
        priority: property.isFeatured ? 0.9 : 0.8,
        images: property.images.slice(0, 5),
      })),
      ...Array.from(publicVendors, ([vendorId, lastModified]) => ({
        url: `${SITE_URL}/vendors/${encodeURIComponent(vendorId)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return [...staticEntries, ...blogEntries];
  }
}
