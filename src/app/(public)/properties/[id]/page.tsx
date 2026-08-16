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
import { SimilarPropertiesCarousel } from "@/features/properties/components/similar-properties-carousel";
import { PropertyViewTracker } from "@/features/properties/components/property-view-tracker";
import { ShortletBookingCard } from "@/features/properties/components/shortlet-booking-card";
import { Footer } from "@/components/shared/footer";
import { getAvailablePropertiesServer } from "@/features/properties/server/get-available-properties";
import { CONTAINER, cn } from "@/lib/utils";

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
    .slice(0, 12);

  return (
    <>
      <PropertyViewTracker propertyId={property.id} />
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

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Property Description
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </section>

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
            {property.purpose === "shortlet" ? (
              <ShortletBookingCard property={property} />
            ) : (
              <VendorContactCard property={property} />
            )}
          </div>
        </div>
      </div>

      <div className={cn(CONTAINER, "py-16")}>
        <SimilarPropertiesCarousel properties={similar} />
      </div>

      <Footer />
    </>
  );
}
