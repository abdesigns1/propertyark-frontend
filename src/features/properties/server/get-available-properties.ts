import "server-only";

import type { AvailablePropertiesResponse } from "@/features/properties/types/api";
import { normalizePropertyResponse } from "@/features/properties/utils/normalize-property-response";

export async function getAvailablePropertiesServer({
  page = 1,
  limit = 100,
}: { page?: number; limit?: number } = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/properties/available`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Unable to load available properties (${response.status})`);

  const payload = (await response.json()) as AvailablePropertiesResponse;
  return {
    properties: payload.data.properties.map(normalizePropertyResponse),
    pagination: payload.data.pagination,
  };
}
