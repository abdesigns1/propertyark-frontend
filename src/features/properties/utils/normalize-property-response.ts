import type {
  Property,
  PropertyListingPurpose,
  PropertyStatus,
  PropertyType,
} from "@/features/properties/types";
import type {
  PropertyApiItem,
  PropertyMediaResponse,
} from "@/features/properties/types/api";
import { getBackendOrigin } from "@/lib/backend-url";

export const PROPERTY_IMAGE_FALLBACK = "/assets/images/hero-property.jpeg";

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
  const value = url.trim();
  if (!value) return value;
  const backendOrigin = getBackendOrigin();

  try {
    const parsed = new URL(value);
    // The backend returns the complete media URL. Keep that origin intact and
    // upgrade legacy HTTP records so deployed HTTPS pages do not hit mixed
    // content blocking in the browser.
    if (
      backendOrigin &&
      parsed.hostname === new URL(backendOrigin).hostname &&
      parsed.protocol === "http:"
    ) {
      const configuredOrigin = new URL(backendOrigin);
      parsed.protocol = configuredOrigin.protocol;
      parsed.port = configuredOrigin.port;
    }
    return parsed.toString();
  } catch {
    // Older records may contain only an upload path. Resolve those against the
    // backend—not the frontend origin—without changing current absolute URLs.
    if (backendOrigin && /^\/?uploads\//i.test(value)) {
      return `${backendOrigin}/${value.replace(/^\/+/, "")}`;
    }
    return value;
  }
}

export function showPropertyImageFallback(image: HTMLImageElement) {
  if (image.src.endsWith(PROPERTY_IMAGE_FALLBACK)) return;
  image.srcset = "";
  image.src = PROPERTY_IMAGE_FALLBACK;
}

/**
 * Preserve the backend's gallery order while consistently placing the saved
 * primary image first so every surface uses it as the property cover.
 */
export function sortPropertyMediaPrimaryFirst(
  media: PropertyMediaResponse[] = [],
) {
  return [...media].sort(
    (first, second) => Number(second.isPrimary) - Number(first.isPrimary),
  );
}

export function normalizePropertyResponse(property: PropertyApiItem): Property {
  const media = sortPropertyMediaPrimaryFirst(property.media);
  const images = media
    .filter((item) => item.type === "IMAGE")
    .map((item) => normalizePropertyMediaUrl(item.url));
  const imageMedia = media
    .filter((item) => item.type === "IMAGE")
    .map((item) => ({
      id: item.id,
      name: item.name,
      url: normalizePropertyMediaUrl(item.url),
    }));
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
    images: images.length ? images : [PROPERTY_IMAGE_FALLBACK],
    imageMedia: imageMedia.length ? imageMedia : undefined,
    videos,
    videoUrl: videos[0],
    amenities: property.amenities ?? [],
    vendorId: property.vendorId,
    vendorName: property.vendor?.fullName,
    vendorAvatarUrl: property.vendor?.avatar,
    vendorPhone: property.vendor?.phone,
    isVerified: true,
    isFeatured: property.isFeatured === true,
    featuredAt: property.featuredAt ?? null,
    featuredUntil: property.featuredUntil ?? null,
    featureExpiresAt: property.featureExpiresAt ?? null,
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
            checkInTime:
              property.checkInTime ?? property.shortletCheckInTime ?? undefined,
            checkOutTime:
              property.checkOutTime ??
              property.shortletCheckOutTime ??
              undefined,
            houseRules: normalizeHouseRules(property.houseRules),
            cancellationPolicy: property.cancellationPolicy ?? undefined,
            paymentPolicy: property.paymentPolicy ?? undefined,
          }
        : undefined,
  };
}
