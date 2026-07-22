import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PropertyGallery } from "@/features/properties/components/property-gallery";
import { PropertyHeader } from "@/features/properties/components/property-header";
import { PropertyOverview } from "@/features/properties/components/property-overview";
import { PropertyInformation } from "@/features/properties/components/property-information";
import { PropertyAmenities } from "@/features/properties/components/property-amenities";
import { PropertyVideo } from "@/features/properties/components/property-video";
import { PropertyMap } from "@/features/properties/components/property-map";
import { PropertyReviews } from "@/features/properties/components/property-reviews";
import { VendorContactCard } from "@/features/properties/components/vendor-contact-card";
import { PropertyCard } from "@/features/properties/components/property-card";
import { Footer } from "@/components/shared/footer";
import { getAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import { CONTAINER, cn } from "@/lib/utils";
import Link from "next/link";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id.startsWith("draft:"))
    redirect(`/vendor/properties/new?draft=${id.slice("draft:".length)}`);

  const { properties } = await getAvailablePropertiesServer();
  const base = properties.find((property) => property.id === id);
  if (!base) return notFound();

  const property = base;
  const similar = properties
    .filter((candidate) => candidate.id !== property.id)
    .slice(0, 3);

  return (
    <>
      <Navbar reserveSpace />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
        ]}
        style={{ marginTop: "2rem" }}
      />

      <div className={cn(CONTAINER, "py-8")}>
        <PropertyHeader property={property} />

        <div className="mt-6">
          <PropertyGallery images={property.images} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-10">
            <PropertyOverview property={property} />
            <PropertyInformation property={property} />
            {property.amenities && (
              <PropertyAmenities amenities={property.amenities} />
            )}

            <div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </div>

            {property.videoUrl && (
              <PropertyVideo
                thumbnailSrc={property.images[0]}
                videoUrl={property.videoUrl}
              />
            )}

            <PropertyMap
              address={`${property.location.address}, ${property.location.city}`}
            />

            {property.reviews && (
              <PropertyReviews
                reviews={property.reviews}
                averageRating={property.rating ?? 5}
                totalReviews={1540}
              />
            )}
          </div>

          <div>
            <VendorContactCard property={property} />
          </div>
        </div>
      </div>

      <section className={cn(CONTAINER, "py-16 text-center")}>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Similar Properties
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        <Link
          href="/properties"
          className="mt-8 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          View All
        </Link>
      </section>

      <Footer />
    </>
  );
}
