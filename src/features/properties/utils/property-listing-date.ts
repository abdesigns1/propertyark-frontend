export interface PropertyListingDateSource {
  listingStatus?: string | null;
  approvalStatus?: string | null;
  reviewStatus?: string | null;
  listedAt?: string | null;
  publishedAt?: string | null;
  approvedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

/** Uses a dedicated publication timestamp when available and safely falls back
 * to the last approval update for active listings from older API versions. */
export function getPropertyListedAt(property: PropertyListingDateSource) {
  const explicitDate =
    property.listedAt ?? property.publishedAt ?? property.approvedAt;
  if (explicitDate) return explicitDate;

  const status = String(
    property.listingStatus ??
      property.approvalStatus ??
      property.reviewStatus ??
      "",
  ).toUpperCase();
  if (
    ["ACTIVE", "APPROVED", "VERIFIED", "ACCEPTED", "PUBLISHED"].includes(status)
  ) {
    return property.updatedAt ?? property.createdAt ?? null;
  }

  return null;
}
