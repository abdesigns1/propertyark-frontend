import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { BecomeVendorBanner } from "@/components/contact/become-vendor-banner";
import { PageBanner } from "@/components/shared/page-banner";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAllAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import {
  getActivePropertySeoLandings,
  propertySeoLandingPath,
} from "@/features/properties/seo/property-seo-landings";
import { createPageMetadata } from "@/lib/seo";
import { CONTAINER, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Explore Properties by Location in Nigeria",
  description:
    "Browse verified PropertyArk listings by location, including properties for sale, rent, land, and shortlets in major Nigerian cities.",
  path: "/locations",
  image: "/hero image updated.jpg",
});

export default async function PropertyLocationsPage() {
  const properties = await getAllAvailablePropertiesServer();
  const activeLandings = getActivePropertySeoLandings(properties);
  const groupedLandings = activeLandings.reduce((groups, landing) => {
    const existing = groups.get(landing.location.slug) ?? [];
    existing.push(landing);
    groups.set(landing.location.slug, existing);
    return groups;
  }, new Map<string, typeof activeLandings>());

  return (
    <>
      <PageBanner
        title="Explore properties by location"
        description="Discover available properties for sale, rent, land, and shortlets across PropertyArk's growing Nigerian marketplace."
        imageSrc="/hero image updated.jpg"
        imageAlt="Modern Nigerian property interior"
      />

      <main className={cn(CONTAINER, "py-14 sm:py-16")}>
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Property locations
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Find properties in leading Nigerian cities
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Choose a location and property category to view matching live
            listings from verified PropertyArk vendors.
          </p>
        </div>

        {activeLandings.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from(groupedLandings.values()).map((landings) => {
              const location = landings[0].location;
              const listingCount = new Set(
                landings.flatMap((landing) =>
                  landing.properties.map((property) => property.id),
                ),
              ).size;

              return (
                <Card key={location.slug}>
                  <CardHeader>
                    <Badge className="w-fit">
                      <MapPin data-icon="inline-start" />
                      {location.region}
                    </Badge>
                    <CardTitle className="text-xl">
                      Properties in {location.name}
                    </CardTitle>
                    <CardDescription>
                      {listingCount} live{" "}
                      {listingCount === 1 ? "listing" : "listings"}
                      {" · "}
                      {landings.length} available{" "}
                      {landings.length === 1 ? "category" : "categories"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-wrap gap-2">
                    {landings.map((landing) => (
                      <Button
                        key={landing.intent.slug}
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link
                          href={propertySeoLandingPath(
                            landing.location,
                            landing.intent,
                          )}
                        >
                          {landing.intent.shortLabel}
                          <ArrowRight data-icon="inline-end" />
                        </Link>
                      </Button>
                    ))}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Location pages are being prepared</EmptyTitle>
              <EmptyDescription>
                Browse all properties while we organize the latest listings by
                city and category.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </main>

      <BecomeVendorBanner />
      <Footer />
    </>
  );
}
