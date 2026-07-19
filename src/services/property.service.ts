import { api } from "@/services/axios";
import type { AvailablePropertiesResponse, PropertyApiItem, PropertyMediaResponse } from "@/features/properties/types/api";
import { normalizePropertyResponse } from "@/features/properties/utils/normalize-property-response";

export interface AvailablePropertyFilters {
  listingTypes?: string[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

async function getFilteredAvailable(filters: AvailablePropertyFilters = {}) {
  const { listingTypes = [], ...commonFilters } = filters;
  const request = (listingType?: string) => api.get<AvailablePropertiesResponse>("/properties/available", {
    params: {
      ...commonFilters,
      listingType,
      // The UI owns pagination, so request the complete filtered collection.
      limit: 1000,
    },
  });
  const responses = await Promise.all(listingTypes.length ? listingTypes.map(request) : [request()]);
  const uniqueProperties = new Map<string, PropertyApiItem>();
  responses.forEach(({ data }) => data.data.properties.forEach((property) => uniqueProperties.set(property.id, property)));
  return [...uniqueProperties.values()].map(normalizePropertyResponse);
}

export const propertyService = {
  getAvailable: async ({ page = 1, limit = 12 }: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get<AvailablePropertiesResponse>("/properties/available", { params: { page, limit } });
    return {
      properties: data.data.properties.map(normalizePropertyResponse),
      pagination: data.data.pagination,
    };
  },
  getAllAvailable: getFilteredAvailable,
  create: async (payload: FormData) => {
    const { data } = await api.post<{ data: PropertyApiItem }>("/properties", payload);
    return normalizePropertyResponse(data.data);
  },
  update: async (propertyId: string, payload: FormData) => {
    const { data } = await api.patch<{ data: PropertyApiItem }>(`/properties/${propertyId}`, payload);
    return normalizePropertyResponse(data.data);
  },
  remove: async (propertyId: string) => {
    const { data } = await api.delete(`/properties/${propertyId}`);
    return data;
  },
  getMedia: async (propertyId: string) => {
    const { data } = await api.get<{ data: PropertyMediaResponse[] }>(`/properties/${propertyId}/media`);
    return data.data;
  },
  setPrimaryMedia: async (mediaId: string) => {
    const { data } = await api.patch(`/properties/media/${mediaId}/primary`);
    return data;
  },
  bulkDeleteMedia: async (propertyId: string, mediaIds: string[]) => {
    const { data } = await api.delete(`/properties/${propertyId}/media/bulk`, { data: { mediaIds } });
    return data;
  },
};
