import type { PropertyApiItem } from "@/features/properties/types/api";
import type { PropertyDraft } from "@/features/vendor/lib/property-drafts";

export type ListingStatus = "published" | "pending" | "draft" | "rejected";

export interface PropertyDraftValues {
  name?: string;
  description?: string;
  type?: string;
  listingType?: string;
  price?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  size?: string;
  sizeUnit?: string;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string[];
}

/**
 * Adapts a local draft to the same shape as a backend property so the table can
 * render both sources through one code path. The `draft:` ID prefix prevents
 * local records from being mistaken for backend entities by action handlers.
 */
export function draftAsProperty(
  draft: PropertyDraft<PropertyDraftValues>,
): PropertyApiItem {
  const values = draft.values;
  const amount = Number(values.price) || 0;
  const listingType = values.listingType || "FOR_SALE";

  return {
    id: `draft:${draft.id}`,
    name: values.name?.trim() || "Untitled property",
    description: values.description || "Incomplete property draft",
    type: values.type || "RESIDENTIAL",
    listingType,
    status: "DRAFT",
    rentAmount: listingType === "FOR_RENT" ? amount : null,
    salePrice: listingType === "FOR_SALE" ? amount : null,
    landFee: listingType === "FOR_LAND" ? amount : null,
    shortletAmount: listingType === "FOR_SHORTLET" ? amount : null,
    address: values.address || "",
    city: values.city || "",
    state: values.state || "",
    country: values.country || "Nigeria",
    size: Number(values.size) || 0,
    sizeUnit: values.sizeUnit,
    bedrooms: Number(values.bedrooms) || 0,
    bathrooms: Number(values.bathrooms) || 0,
    amenities: values.amenities || [],
    vendorId: "local",
    createdAt: draft.updatedAt,
  };
}

export function formatPropertyPrice(property: PropertyApiItem) {
  const amount = propertyPrice(property);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function propertyStatus(property: PropertyApiItem): {
  key: ListingStatus;
  label: string;
} {
  // Availability (`AVAILABLE`, `RENTED`, etc.) and admin approval are separate
  // concepts. Never treat an AVAILABLE property as published until its review
  // field or verification boolean confirms that an admin approved it.
  const rawStatus = (
    property.listingStatus ||
    property.approvalStatus ||
    property.reviewStatus ||
    property.verificationStatus ||
    ""
  ).toUpperCase();

  if (
    ["ACTIVE", "APPROVED", "ACCEPTED", "VERIFIED", "PUBLISHED"].includes(
      rawStatus,
    ) ||
    property.isApproved === true ||
    property.approved === true ||
    property.isVerified === true
  ) {
    return { key: "published", label: "Published" };
  }
  if (rawStatus.includes("DRAFT") || property.status?.toUpperCase() === "DRAFT") {
    return { key: "draft", label: "Draft" };
  }
  if (["REJECTED", "DECLINED"].includes(rawStatus)) {
    return { key: "rejected", label: "Rejected" };
  }
  return { key: "pending", label: "Pending approval" };
}

export function propertyImage(property: PropertyApiItem) {
  // Primary media wins; the bundled image keeps incomplete drafts presentable.
  return (
    [...(property.media ?? [])]
      .sort((first, second) => Number(second.isPrimary) - Number(first.isPrimary))
      .find((item) => item.type === "IMAGE")?.url ??
    "/assets/images/hero-property.jpeg"
  );
}

export function propertyStatusVariant(
  status: ListingStatus,
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "published") return "default";
  if (status === "rejected") return "destructive";
  return status === "pending" ? "secondary" : "outline";
}

function propertyPrice(property: PropertyApiItem) {
  if (property.listingType === "FOR_RENT") return property.rentAmount ?? 0;
  if (property.listingType === "FOR_LAND") return property.landFee ?? 0;
  if (property.listingType === "FOR_SHORTLET") {
    return property.shortletAmount ?? 0;
  }
  return property.salePrice ?? 0;
}
