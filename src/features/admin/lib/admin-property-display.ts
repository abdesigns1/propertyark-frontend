import { normalizePropertyMediaUrl } from "@/features/properties/utils/normalize-property-response";
import type { AdminManagedProperty } from "@/services/admin.service";

export function adminPropertyPrice(property: AdminManagedProperty) {
  const amount =
    property.salePrice ??
    property.rentAmount ??
    property.landFee ??
    property.shortletAmount ??
    0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function adminPropertyImage(property: AdminManagedProperty) {
  const media = [...(property.media ?? [])].sort(
    (first, second) => Number(second.isPrimary) - Number(first.isPrimary),
  );
  const url = media.find((item) => item.type === "IMAGE")?.url;
  return url
    ? normalizePropertyMediaUrl(url)
    : "/assets/images/hero-property.jpeg";
}

export function adminPropertyLocation(property: AdminManagedProperty) {
  return [property.address, property.city, property.state]
    .filter(Boolean)
    .join(", ");
}

export function adminPropertyCategory(property: AdminManagedProperty) {
  const categories: Record<string, string> = {
    FOR_SALE: "Sell",
    FOR_RENT: "Rent",
    FOR_LAND: "Land",
    FOR_SHORTLET: "Shortlet",
  };

  return categories[property.listingType.toUpperCase()] ?? "Sell";
}
