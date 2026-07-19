export interface PropertyMediaResponse {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  isPrimary: boolean;
}

export interface PropertyApiItem {
  id: string;
  name: string;
  description: string;
  type: string;
  listingType: string;
  status: string;
  rentAmount: number | null;
  salePrice: number | null;
  landFee: number | null;
  shortletAmount: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  size: number;
  sizeUnit?: string;
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
  vendorId: string;
  createdAt: string;
  updatedAt?: string;
  media?: PropertyMediaResponse[];
  priceDisplay?: string;
  vendor?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface AvailablePropertiesResponse {
  success: boolean;
  message: string;
  data: {
    properties: PropertyApiItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
