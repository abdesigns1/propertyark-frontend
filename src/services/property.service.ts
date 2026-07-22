import { api } from "@/services/axios";
import type {
  AvailablePropertiesResponse,
  PropertyApiItem,
  PropertyMediaResponse,
} from "@/features/properties/types/api";
import { normalizePropertyResponse } from "@/features/properties/utils/normalize-property-response";

export interface AvailablePropertyFilters {
  listingTypes?: string[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface AvailablePropertiesPageOptions {
  page?: number;
  limit?: number;
  filters?: AvailablePropertyFilters;
}

export interface VendorPropertiesResult {
  properties: PropertyApiItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

function normalizeVendorPropertiesResponse(
  value: unknown,
  page: number,
  limit: number,
): VendorPropertiesResult {
  const root =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const properties = [
    data.properties,
    data.items,
    data.results,
    root.properties,
  ].find(Array.isArray) as PropertyApiItem[] | undefined;
  const paginationSource =
    data.pagination && typeof data.pagination === "object"
      ? (data.pagination as Record<string, unknown>)
      : data;
  const rows = properties ?? [];
  const numberValue = (key: string, fallback: number) => {
    const candidate = paginationSource[key];
    return typeof candidate === "number"
      ? candidate
      : typeof candidate === "string" && !Number.isNaN(Number(candidate))
        ? Number(candidate)
        : fallback;
  };
  const total = numberValue("total", rows.length);
  return {
    properties: rows,
    pagination: {
      page: numberValue("page", page),
      limit: numberValue("limit", limit),
      total,
      pages: numberValue("pages", Math.max(1, Math.ceil(total / limit))),
    },
  };
}

async function getFilteredAvailable(filters: AvailablePropertyFilters = {}) {
  const { listingTypes = [], ...commonFilters } = filters;
  const request = (listingType?: string) =>
    api.get<AvailablePropertiesResponse>("/properties/available", {
      params: {
        ...commonFilters,
        listingType,
        // The UI owns pagination, so request the complete filtered collection.
        limit: 1000,
      },
    });
  const responses = await Promise.all(
    listingTypes.length ? listingTypes.map(request) : [request()],
  );
  const uniqueProperties = new Map<string, PropertyApiItem>();
  responses.forEach(({ data }) =>
    data.data.properties.forEach((property) =>
      uniqueProperties.set(property.id, property),
    ),
  );
  return [...uniqueProperties.values()].map(normalizePropertyResponse);
}

export const propertyService = {
  getVendorProperties: async ({
    page = 1,
    limit = 1000,
  }: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get<unknown>("/properties", {
      params: { page, limit },
    });
    return normalizeVendorPropertiesResponse(data, page, limit);
  },
  getAvailable: async ({
    page = 1,
    limit = 12,
  }: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get<AvailablePropertiesResponse>(
      "/properties/available",
      { params: { page, limit } },
    );
    return {
      properties: data.data.properties.map(normalizePropertyResponse),
      pagination: data.data.pagination,
    };
  },
  getAvailablePage: async ({
    page = 1,
    limit = 12,
    filters = {},
  }: AvailablePropertiesPageOptions = {}) => {
    const { listingTypes = [], ...commonFilters } = filters;
    const { data } = await api.get<AvailablePropertiesResponse>(
      "/properties/available",
      {
        params: {
          page,
          limit,
          ...commonFilters,
          listingType: listingTypes.length === 1 ? listingTypes[0] : undefined,
          listingTypes: listingTypes.length > 1 ? listingTypes : undefined,
        },
      },
    );

    return {
      properties: data.data.properties.map(normalizePropertyResponse),
      pagination: data.data.pagination,
    };
  },
  getAllAvailable: getFilteredAvailable,
  create: async (payload: FormData) => {
    const { data } = await api.post<{ data: PropertyApiItem }>(
      "/properties",
      payload,
    );
    return normalizePropertyResponse(data.data);
  },
  update: async (propertyId: string, payload: FormData) => {
    const { data } = await api.patch<{ data: PropertyApiItem }>(
      `/properties/${propertyId}`,
      payload,
    );
    return normalizePropertyResponse(data.data);
  },
  remove: async (propertyId: string) => {
    if (propertyId.startsWith("draft:")) {
      const { deletePropertyDraft } = await import(
        "@/features/vendor/lib/property-drafts"
      );
      await deletePropertyDraft(propertyId.slice("draft:".length));
      return { success: true };
    }
    const { data } = await api.delete(`/properties/${propertyId}`);
    return data;
  },
  getMedia: async (propertyId: string) => {
    const { data } = await api.get<{ data: PropertyMediaResponse[] }>(
      `/properties/${propertyId}/media`,
    );
    return data.data;
  },
  setPrimaryMedia: async (mediaId: string) => {
    const { data } = await api.patch(`/properties/media/${mediaId}/primary`);
    return data;
  },
  bulkDeleteMedia: async (propertyId: string, mediaIds: string[]) => {
    const { data } = await api.delete(`/properties/${propertyId}/media/bulk`, {
      data: { mediaIds },
    });
    return data;
  },
};
