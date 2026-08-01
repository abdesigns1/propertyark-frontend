import { api } from "@/services/axios";
import type {
  AvailablePropertiesResponse,
  PropertyApiItem,
  PropertyMediaResponse,
} from "@/features/properties/types/api";
import {
  normalizePropertyMediaUrl,
  normalizePropertyResponse,
} from "@/features/properties/utils/normalize-property-response";

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

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function normalizeMediaItem(value: unknown): PropertyMediaResponse | null {
  if (typeof value === "string" && value.trim()) {
    return { id: value, url: value, type: "IMAGE", isPrimary: false };
  }

  const media = asRecord(value);
  const id = media.id ?? media._id ?? media.mediaId;
  const url =
    media.url ?? media.fileUrl ?? media.secureUrl ?? media.path ?? media.location;
  if (typeof id !== "string" || typeof url !== "string") return null;

  const rawType = String(media.type ?? media.mediaType ?? media.resourceType ?? "")
    .toUpperCase();
  const type = rawType.includes("VIDEO") ? "VIDEO" : "IMAGE";

  return {
    id,
    url: normalizePropertyMediaUrl(url),
    type,
    isPrimary: Boolean(
      media.isPrimary ?? media.primary ?? media.isCover ?? media.cover,
    ),
  };
}

/** Handles both `{ data: [] }` and `{ data: { media: [] } }` API envelopes. */
function normalizeMediaResponse(value: unknown): PropertyMediaResponse[] {
  const root = asRecord(value);
  const data = root.data ?? value;
  const source = Array.isArray(data)
    ? data
    : [
        asRecord(data).media,
        asRecord(data).items,
        asRecord(data).results,
        root.media,
      ].find(Array.isArray) ?? [];

  return source
    .map(normalizeMediaItem)
    .filter((item): item is PropertyMediaResponse => Boolean(item));
}

function normalizeVendorProperty(value: unknown): PropertyApiItem {
  const property = asRecord(value) as unknown as PropertyApiItem;
  const source = asRecord(value);
  const embeddedMedia =
    [source.media, source.medias, source.photos, source.images].find(
      Array.isArray,
    ) ?? [];

  return {
    ...property,
    media: normalizeMediaResponse({ data: embeddedMedia }),
  };
}

function unwrapProperty(value: unknown): PropertyApiItem {
  const root = asRecord(value);
  const data = asRecord(root.data);
  const candidate = data.property ?? root.property ?? root.data ?? value;
  return normalizeVendorProperty(candidate);
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
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const properties = [
    Array.isArray(root.data) ? root.data : undefined,
    data.properties,
    data.items,
    data.results,
    root.properties,
  ].find(Array.isArray) as PropertyApiItem[] | undefined;
  const paginationSource =
    data.pagination && typeof data.pagination === "object"
      ? (data.pagination as Record<string, unknown>)
      : data;
  const rows = (properties ?? []).map(normalizeVendorProperty);
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
  getById: async (propertyId: string) => {
    const { data } = await api.get<unknown>(`/properties/${propertyId}`);
    return unwrapProperty(data);
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
    const { data } = await api.post<unknown>("/properties", payload);
    return unwrapProperty(data);
  },
  update: async (propertyId: string, payload: FormData) => {
    const { data } = await api.patch<unknown>(
      `/properties/${propertyId}`,
      payload,
    );
    return unwrapProperty(data);
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
    const { data } = await api.get<unknown>(
      `/properties/${propertyId}/media`,
    );
    return normalizeMediaResponse(data);
  },
  uploadMedia: async (propertyId: string, payload: FormData) => {
    const { data } = await api.post<unknown>(
      `/properties/${propertyId}/media`,
      payload,
    );
    return normalizeMediaResponse(data);
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
