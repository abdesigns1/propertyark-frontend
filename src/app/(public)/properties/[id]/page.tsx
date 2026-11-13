import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PropertyGallery } from "@/features/properties/components/property-gallery";
import { PropertyHeader } from "@/features/properties/components/property-header";
import { PropertyOverview } from "@/features/properties/components/property-overview";
import {
  PropertyInformation,
  PropertyLandmarks,
} from "@/features/properties/components/property-information";
import { PropertyAmenities } from "@/features/properties/components/property-amenities";
import { PropertyDescriptionContent } from "@/features/properties/components/property-description-content";
import { PropertyVideo } from "@/features/properties/components/property-video";
import { PropertyMap } from "@/features/properties/components/property-map";
import { VendorContactCard } from "@/features/properties/components/vendor-contact-card";
import { SimilarPropertiesCarousel } from "@/features/properties/components/similar-properties-carousel";
import { PropertyViewTracker } from "@/features/properties/components/property-view-tracker";
import { ShortletBookingCard } from "@/features/properties/components/shortlet-booking-card";
import { ShortletStayInformation } from "@/features/properties/components/shortlet-stay-information";
import { Footer } from "@/components/shared/footer";
import {
  getAllAvailablePropertiesServer,
  getFeaturedPropertiesServer,
} from "@/features/properties/server/get-available-properties";
import { CONTAINER, cn } from "@/lib/utils";
import { serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Property } from "@/features/properties/types";

const getPropertyResults = cache(getAllAvailablePropertiesServer);

async function getProperty(id: string) {
  const properties = await getPropertyResults();
  return properties.find((property) => property.id === id);
}

function propertyDescription(description: string) {
  const normalized = description
    .replace(/(\*\*|__|\*|_|~~|`)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 155
    ? `${normalized.slice(0, 152).trimEnd()}...`
    : normalized;
}

function propertySchemaType(type: Property["type"]) {
  if (type === "apartment") return "Apartment";
  if (type === "shortlet") return "Accommodation";
  if (type === "land" || type === "commercial") return "Place";
  return "House";
}

function offerBusinessFunction(purpose: Property["purpose"]) {
  return purpose === "rent" || purpose === "shortlet"
    ? "http://purl.org/goodrelations/v1#LeaseOut"
    : "http://purl.org/goodrelations/v1#Sell";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (id.startsWith("draft:"))
    return { robots: { index: false, follow: false } };

  try {
    const property = await getProperty(id);
    if (!property) return { robots: { index: false, follow: false } };

    const description = propertyDescription(property.description);
    const path = `/properties/${property.id}`;
    return {
      title: property.title,
      description,
      alternates: { canonical: path },
      openGraph: {
        title: property.title,
        description,
        url: path,
        siteName: SITE_NAME,
        locale: "en_NG",
        type: "website",
        images: property.images.map((url) => ({
          url,
          alt: property.title,
        })),
      },
      twitter: {
        card: "summary_large_image",
        title: property.title,
        description,
        images: property.images.slice(0, 1),
      },
    };
  } catch {
    return {
      title: "Property listing",
      robots: { index: false, follow: false },
    };
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id.startsWith("draft:"))
    redirect(`/vendor/properties/new?draft=${id.slice("draft:".length)}`);

  const [properties, featuredProperties] = await Promise.all([
    getPropertyResults(),
    getFeaturedPropertiesServer(),
  ]);
  const base = properties.find((property) => property.id === id);
  if (!base) return notFound();

  const featuredProperty = featuredProperties.find(
    (candidate) => candidate.id === id,
  );
  const property = featuredProperty
    ? {
        ...base,
        isFeatured: true,
        featuredAt: featuredProperty.featuredAt,
        featuredUntil: featuredProperty.featuredUntil,
        featureExpiresAt: featuredProperty.featureExpiresAt,
      }
    : base;
  const similar = properties
    .filter((candidate) => candidate.id !== property.id)
    .slice(0, 12);
  const propertyUrl = `${SITE_URL}/properties/${property.id}`;
  const propertyEntityId = `${propertyUrl}#property`;
  const offerEntityId = `${propertyUrl}#offer`;
  const address = {
    "@type": "PostalAddress",
    streetAddress: property.location.address,
    addressLocality: property.location.city,
    addressRegion: property.location.state,
    addressCountry: property.location.country || "NG",
  };
  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": `${propertyUrl}#listing`,
        url: propertyUrl,
        name: property.title,
        description: propertyDescription(property.description),
        datePosted: property.listedAt ?? property.createdAt,
        dateModified: property.updatedAt ?? property.createdAt,
        primaryImageOfPage: property.images[0]
          ? {
              "@type": "ImageObject",
              url: property.images[0],
            }
          : undefined,
        mainEntity: { "@id": propertyEntityId },
        about: [{ "@id": propertyEntityId }, { "@id": offerEntityId }],
      },
      {
        "@type": propertySchemaType(property.type),
        "@id": propertyEntityId,
        name: property.title,
        description: propertyDescription(property.description),
        image: property.images,
        address,
        geo:
          typeof property.location.latitude === "number" &&
          typeof property.location.longitude === "number"
            ? {
                "@type": "GeoCoordinates",
                latitude: property.location.latitude,
                longitude: property.location.longitude,
              }
            : undefined,
        floorSize: property.sizeSqm
          ? {
              "@type": "QuantitativeValue",
              value: property.sizeSqm,
              unitCode: property.sizeUnit === "sqft" ? "FTK" : "MTK",
            }
          : undefined,
        numberOfBedrooms:
          property.type === "land" || property.type === "commercial"
            ? undefined
            : property.bedrooms,
        numberOfBathroomsTotal:
          property.type === "land" || property.type === "commercial"
            ? undefined
            : property.bathrooms,
        amenityFeature: property.amenities?.map((amenity) => ({
          "@type": "LocationFeatureSpecification",
          name: amenity,
          value: true,
        })),
        aggregateRating:
          property.rating && property.reviewCount
            ? {
                "@type": "AggregateRating",
                ratingValue: property.rating,
                ratingCount: property.reviewCount,
              }
            : undefined,
        subjectOf: { "@id": `${propertyUrl}#listing` },
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Property type",
            value: property.type,
          },
          {
            "@type": "PropertyValue",
            name: "Listing purpose",
            value: property.purpose,
          },
          property.landSizeSqm
            ? {
                "@type": "PropertyValue",
                name: "Land size",
                value: property.landSizeSqm,
                unitText: "square metres",
              }
            : undefined,
        ].filter(Boolean),
      },
      {
        "@type": "Offer",
        "@id": offerEntityId,
        url: propertyUrl,
        price: property.price,
        priceCurrency: property.currency,
        availability:
          property.status === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        businessFunction: offerBusinessFunction(property.purpose),
        itemOffered: { "@id": propertyEntityId },
        availableAtOrFrom: {
          "@type": "Place",
          address,
        },
        seller: {
          "@type": "Organization",
          name: property.vendorName || SITE_NAME,
          url: property.vendorId
            ? `${SITE_URL}/vendors/${encodeURIComponent(property.vendorId)}`
            : SITE_URL,
        },
      },
    ],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Properties",
        item: `${SITE_URL}/properties`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.title,
        item: propertyUrl,
      },
    ],
  };

  return (
    <>
      <script
        id="property-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(propertyJsonLd) }}
      />
      <script
        id="property-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
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
          <PropertyGallery
            images={property.images}
            imageMedia={property.imageMedia}
            streetViewAddress={[
              property.location.address,
              property.location.city,
              property.location.state,
              property.location.country,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-10">
            <PropertyOverview property={property} />
            <PropertyInformation property={property} showLandmarks={false} />

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Property Description
              </h2>
              <PropertyDescriptionContent
                description={property.description}
                className="mt-4"
              />
            </section>

            <PropertyLandmarks property={property} />

            {property.amenities && (
              <PropertyAmenities amenities={property.amenities} />
            )}

            {property.purpose === "shortlet" && property.shortletDetails && (
              <ShortletStayInformation
                checkInTime={property.shortletDetails.checkInTime}
                checkOutTime={property.shortletDetails.checkOutTime}
                houseRules={property.shortletDetails.houseRules}
                cancellationPolicy={property.shortletDetails.cancellationPolicy}
                paymentPolicy={property.shortletDetails.paymentPolicy}
              />
            )}

            {property.videoUrl && (
              <PropertyVideo
                thumbnailSrc={property.images[0]}
                videoUrl={property.videoUrl}
              />
            )}

            <PropertyMap
              address={`${property.location.address}, ${property.location.city}`}
            />

            {/* The property reviews section will be restored later. */}
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
