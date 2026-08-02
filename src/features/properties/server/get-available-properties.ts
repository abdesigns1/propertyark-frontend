import "server-only";

import type { AvailablePropertiesResponse } from "@/features/properties/types/api";
import { normalizePropertyResponse } from "@/features/properties/utils/normalize-property-response";

const RETRY_DELAYS_MS = [0, 1_000, 2_000] as const;

async function fetchWithRetry(url: URL) {
  let lastError: unknown;

  for (const delay of RETRY_DELAYS_MS) {
    if (delay) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      // Retry transient hosted-service failures; validation and authorization
      // responses should be returned immediately to avoid hiding real issues.
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`Property service returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error("The property service is temporarily unavailable.", {
    cause: lastError,
  });
}

export async function getAvailablePropertiesServer({
  page = 1,
  limit = 100,
}: { page?: number; limit?: number } = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/properties/available`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetchWithRetry(url);
  if (!response.ok)
    throw new Error(`Unable to load available properties (${response.status})`);

  const payload = (await response.json()) as AvailablePropertiesResponse;
  return {
    properties: payload.data.properties.map(normalizePropertyResponse),
    pagination: payload.data.pagination,
  };
}
