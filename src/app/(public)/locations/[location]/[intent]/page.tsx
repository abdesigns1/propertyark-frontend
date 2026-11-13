import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, MapPin, WalletCards } from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyCard } from "@/features/properties/components/property-card";
import {
  getActivePropertySeoLandingsForLocationServer,
  getPropertySeoLandingServer,
} from "@/features/properties/server/get-property-seo-landing";
import {
  propertySeoLandingDescription,
  propertySeoLandingPath,
  propertySeoLandingTitle,
} from "@/features/properties/seo/property-seo-landings";
import { serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { CONTAINER, cn } from "@/lib/utils";

interface PropertySeoLandingPageProps {
  params: Promise<{ location: string; intent: string }>;
}

export const dynamic = "force-dynamic";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function medianPrice(prices: number[]) {
  const sorted = prices.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export async function generateMetadata({
  params,
}: PropertySeoLandingPageProps): Promise<Metadata> {
  const { location: locationSlug, intent: intentSlug } = await params;
  const landing = await getPropertySeoLandingServer(locationSlug, intentSlug);

  if (!landing || !landing.properties.length) {
    return { title: "Property search", robots: { index: false, follow: true } };
  }

  const title = propertySeoLandingTitle(landing.location, landing.intent);
  const description = propertySeoLandingDescription(
    landing.location,
    landing.intent,
    landing.properties.length,
  );
  const path = propertySeoLandingPath(landing.location, landing.intent);
  const image = landing.properties[0]?.images[0];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_NG",
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PropertySeoLandingPage({
  params,
}: PropertySeoLandingPageProps) {
  const { location: locationSlug, intent: intentSlug } = await params;
  const landing = await getPropertySeoLandingServer(locationSlug, intentSlug);
  if (!landing || !landing.properties.length) notFound();

  const title = propertySeoLandingTitle(landing.location, landing.intent);
  const description = propertySeoLandingDescription(
    landing.location,
    landing.intent,
    landing.properties.length,
  );
  const pageUrl = `${SITE_URL}${propertySeoLandingPath(landing.location, landing.intent)}`;
  const visibleProperties = landing.properties.slice(0, 12);
  const median = medianPrice(
    landing.properties.map((property) => property.price),
  );
  const currency = landing.properties[0]?.currency ?? "NGN";
  const relatedLandings = (
    await getActivePropertySeoLandingsForLocationServer(locationSlug)
  )
    .filter(
      (candidate) =>
        candidate.location.slug === landing.location.slug &&
        candidate.intent.slug !== landing.intent.slug,
    )
    .slice(0, 5);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    url: pageUrl,
    name: title,
    description,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: landing.properties.length,
      itemListElement: visibleProperties.map((property, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: property.title,
        url: `${SITE_URL}/properties/${property.id}`,
      })),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Property locations",
        item: `${SITE_URL}/locations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: landing.location.name,
        item: pageUrl,
      },
      { "@type": "ListItem", position: 4, name: title, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        id="property-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        id="property-collection-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <PageBanner
        title={title}
        description={description}
        imageSrc="/hero image updated.jpg"
        imageAlt={`Properties in ${landing.location.name}`}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Locations", href: "/locations" },
          { label: landing.location.name },
        ]}
      />

      <main className={cn(CONTAINER, "py-12 sm:py-16")}>
        <section aria-labelledby="location-overview-heading">
          <div className="mb-8 max-w-3xl">
            <Badge>{landing.location.region}</Badge>
            <h2
              id="location-overview-heading"
              className="mt-3 text-3xl font-semibold tracking-tight"
            >
              Explore {landing.intent.heading.toLowerCase()} in{" "}
              {landing.location.name}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Compare current asking prices, locations, property features, and
              verified vendor details before contacting a vendor or arranging an
              inspection through PropertyArk.
            </p>
          </div>

          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Available listings</CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 aria-hidden="true" />
                  {landing.properties.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Median asking price</CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <WalletCards aria-hidden="true" />
                  {formatPrice(median, currency)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Location</CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MapPin aria-hidden="true" />
                  {landing.location.name}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section aria-labelledby="available-properties-heading">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="available-properties-heading"
                className="text-2xl font-semibold tracking-tight"
              >
                Available properties
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {visibleProperties.length} of{" "}
                {landing.properties.length} matching listings.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties">
                Browse all properties
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {relatedLandings.length ? (
          <section
            aria-labelledby="related-property-searches-heading"
            className="mt-16"
          >
            <Card>
              <CardHeader>
                <CardTitle id="related-property-searches-heading">
                  Related property searches in {landing.location.name}
                </CardTitle>
                <CardDescription>
                  Explore more listing categories available in this location.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {relatedLandings.map((related) => (
                  <Button key={related.intent.slug} asChild variant="outline">
                    <Link
                      href={propertySeoLandingPath(
                        related.location,
                        related.intent,
                      )}
                    >
                      {related.intent.heading} in {related.location.name}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </section>
        ) : null}
      </main>

      <Footer />
    </>
  );
}
