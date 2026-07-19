import type {
  PropertyListingPurpose,
  PropertyType,
} from "@/features/properties/types";

export const PURPOSE_LABELS: Record<PropertyListingPurpose, string> = {
  sale: "For Sale",
  rent: "For Rent",
  shortlet: "Shortlet",
  land: "Land",
};

export const PURPOSE_BADGE_STYLES: Record<PropertyListingPurpose, string> = {
  sale: "bg-primary text-primary-foreground",
  rent: "bg-secondary text-secondary-foreground",
  shortlet: "bg-foreground text-background",
  land: "bg-success text-white",
};

export function isLandType(type: PropertyType) {
  return type === "land";
}
