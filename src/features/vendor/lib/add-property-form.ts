export type ListingType =
  | "FOR_SALE"
  | "FOR_RENT"
  | "FOR_LAND"
  | "FOR_SHORTLET";

export type PropertyType =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INDUSTRIAL"
  | "LAND"
  | "MIXED_USE";

export interface AddPropertyFormValues {
  name: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  size: string;
  sizeUnit: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
}

export interface LegalFiles {
  ownership: File[];
  identification: File[];
  tax: File[];
}

export const INITIAL_PROPERTY_VALUES: AddPropertyFormValues = {
  name: "",
  description: "",
  type: "RESIDENTIAL",
  listingType: "FOR_SALE",
  price: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
  zipCode: "",
  size: "",
  sizeUnit: "sqm",
  bedrooms: "",
  bathrooms: "",
  amenities: [],
};

export const PROPERTY_STEPS = [
  "Basic Info",
  "Details",
  "Images",
  "Legal documents",
  "Review",
];

export const PRICE_FIELDS: Record<ListingType, string> = {
  FOR_SALE: "salePrice",
  FOR_RENT: "rentAmount",
  FOR_LAND: "landFee",
  FOR_SHORTLET: "shortletAmount",
};

export const PRICE_LABELS: Record<ListingType, string> = {
  FOR_SALE: "Asking Price",
  FOR_RENT: "Monthly Rent",
  FOR_LAND: "Land Fee",
  FOR_SHORTLET: "Shortlet Amount",
};

export function readablePropertyValue(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPropertyMoney(value: string) {
  const amount = Number(value);
  if (!amount) return "Price not set";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
