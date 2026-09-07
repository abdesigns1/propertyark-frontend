import type {
  Property,
  PropertyListingPurpose,
  PropertyStatus,
  PropertyType,
} from "@/features/properties/types";
import type { PropertyApiItem } from "@/features/properties/types/api";
import { trustedUploadProxyUrl } from "@/lib/property-media-security";

const TYPE_MAP: Record<string, PropertyType> = {
  RESIDENTIAL: "apartment",
  COMMERCIAL: "commercial",
  INDUSTRIAL: "commercial",
  LAND: "land",
  MIXED_USE: "commercial",
};

const PURPOSE_MAP: Record<string, PropertyListingPurpose> = {
  FOR_RENT: "rent",
  FOR_SALE: "sale",
  FOR_LAND: "land",
  FOR_SHORTLET: "shortlet",
};

const STATUS_MAP: Record<string, PropertyStatus> = {
  AVAILABLE: "available",
  SOLD: "sold",
  RENTED: "rented",
  OCCUPIED: "rented",
};

const BLOCKING_BOOKING_STATUSES = new Set([
  "PENDING",
  "APPROVED",
  "ACCEPTED",
  "CONFIRMED",
  "PAID",
  "CHECKED_IN",
]);

function getPrice(property: PropertyApiItem) {
  if (property.listingType === "FOR_RENT") return property.rentAmount ?? 0;
  if (property.listingType === "FOR_SALE") return property.salePrice ?? 0;
  if (property.listingType === "FOR_LAND") return property.landFee ?? 0;
  return property.shortletAmount ?? 0;
}

function normalizeHouseRules(value: unknown) {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((rule) => rule.trim())
      .filter(Boolean);
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed))
      return parsed
        .map(String)
        .map((rule) => rule.trim())
        .filter(Boolean);
  } catch {
    // Support older records stored as newline-separated text.
  }
  return value
    .split(/\r?\n/)
    .map((rule) => rule.trim())
    .filter(Boolean);
}

export function normalizePropertyMediaUrl(url: string) {
  return trustedUploadProxyUrl(url, "property") ?? url;
}

export function normalizePropertyResponse(property: PropertyApiItem): Property {
  const media = [...(property.media ?? [])].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
  const images = media
    .filter((item) => item.type === "IMAGE")
    .map((item) => normalizePropertyMediaUrl(item.url));
  const videos = media
    .filter((item) => item.type === "VIDEO")
    .map((item) => normalizePropertyMediaUrl(item.url));
  return {
    id: property.id,
    title: property.name,
    description: property.description,
    price: getPrice(property),
    // The backend returns raw property amounts while the product's buyer-facing
    // currency is Naira. Do not infer currency from the legacy priceDisplay text.
    currency: "NGN",
    type: TYPE_MAP[property.type] ?? "commercial",
    purpose: PURPOSE_MAP[property.listingType] ?? "sale",
    status: STATUS_MAP[property.status] ?? "pending-approval",
    location: {
      address: property.address,
      city: property.city,
      state: property.state,
      country: property.country,
    },
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.size,
    sizeUnit: property.sizeUnit?.toLowerCase() === "sqft" ? "sqft" : "sqm",
    images: images.length ? images : ["/assets/images/hero-property.jpeg"],
    videos,
    videoUrl: videos[0],
    amenities: property.amenities ?? [],
    vendorId: property.vendorId,
    vendorName: property.vendor?.fullName,
    vendorAvatarUrl: property.vendor?.avatar,
    vendorPhone: property.vendor?.phone,
    isVerified: true,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    unavailableDateRanges: (property.bookedSlots ?? [])
      .filter((slot) =>
        BLOCKING_BOOKING_STATUSES.has(slot.status.toUpperCase()),
      )
      .filter((slot) => slot.checkInDate && slot.checkOutDate)
      .map((slot) => ({
        start: slot.checkInDate,
        end: slot.checkOutDate,
      })),
    shortletDetails:
      property.listingType === "FOR_SHORTLET"
        ? {
            checkInTime: property.shortletCheckInTime ?? undefined,
            checkOutTime: property.shortletCheckOutTime ?? undefined,
            houseRules: normalizeHouseRules(property.houseRules),
            cancellationPolicy: property.cancellationPolicy ?? undefined,
            paymentPolicy: property.paymentPolicy ?? undefined,
          }
        : undefined,
  };
}
