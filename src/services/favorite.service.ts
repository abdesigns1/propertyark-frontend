import type { Property } from "@/features/properties/types";
import type { PropertyApiItem } from "@/features/properties/types/api";
import { normalizePropertyResponse } from "@/features/properties/utils/normalize-property-response";
import { api } from "@/services/axios";
import { propertyService } from "@/services/property.service";

export interface FavoritesResult {
  properties: Property[];
  propertyIds: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function extractFavoriteRows(value: unknown) {
  if (Array.isArray(value)) return value;
  const root = objectValue(value);
  if (Array.isArray(root.data)) return root.data;
  const data = objectValue(root.data);
  const candidates = [
    data.favorites,
    data.properties,
    data.items,
    data.results,
    root.favorites,
    root.properties,
    root.items,
  ];
  return (candidates.find(Array.isArray) as unknown[] | undefined) ?? [];
}

function favoriteProperty(row: unknown) {
  const item = objectValue(row);
  const nested = objectValue(item.property);
  const candidate = Object.keys(nested).length ? nested : item;
  return typeof candidate.id === "string" && typeof candidate.name === "string"
    ? (candidate as unknown as PropertyApiItem)
    : null;
}

function favoritePropertyId(row: unknown) {
  const item = objectValue(row);
  const nested = objectValue(item.property);
  const candidate = nested.id ?? item.propertyId ?? item.property_id;
  if (typeof candidate === "string") return candidate;
  return typeof item.name === "string" && typeof item.id === "string"
    ? item.id
    : null;
}

export const favoriteService = {
  getAll: async ({ page = 1, limit = 1000 } = {}): Promise<FavoritesResult> => {
    const { data: response } = await api.get<unknown>("/favorites", {
      params: { page, limit },
    });
    const root = objectValue(response);
    const data = objectValue(root.data);
    const rows = extractFavoriteRows(response);
    const propertyIds = Array.from(
      new Set(
        rows.map(favoritePropertyId).filter((id): id is string => Boolean(id)),
      ),
    );
    let properties = rows
      .map(favoriteProperty)
      .filter((property): property is PropertyApiItem => Boolean(property))
      .map(normalizePropertyResponse);

    // Some API deployments return favorite IDs without expanding the property.
    // Resolve those IDs against the public collection so the UI remains usable.
    if (properties.length < propertyIds.length) {
      const available = await propertyService.getAvailable({
        page: 1,
        limit: 1000,
      });
      const availableById = new Map(
        available.properties.map((property) => [property.id, property]),
      );
      properties = propertyIds
        .map((propertyId) => availableById.get(propertyId))
        .filter((property): property is Property => Boolean(property));
    }

    const paginationSource = objectValue(data.pagination);
    const total = numberValue(
      paginationSource.total ?? data.total ?? root.total,
      propertyIds.length,
    );
    const resolvedLimit = numberValue(
      paginationSource.limit ?? data.limit ?? root.limit,
      limit,
    );

    return {
      properties,
      propertyIds,
      pagination: {
        page: numberValue(
          paginationSource.page ?? data.page ?? root.page,
          page,
        ),
        limit: resolvedLimit,
        total,
        pages: numberValue(
          paginationSource.pages ?? data.pages ?? root.pages,
          Math.max(1, Math.ceil(total / resolvedLimit)),
        ),
      },
    };
  },
  add: async (propertyId: string) => {
    const { data } = await api.post(`/favorites/${propertyId}`);
    return data;
  },
  remove: async (propertyId: string) => {
    const { data } = await api.delete(`/favorites/${propertyId}`);
    return data;
  },
};
