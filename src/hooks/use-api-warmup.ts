"use client";

import { useEffect } from "react";

const WARMUP_KEY = "propertyark-api-warmup-started";

/**
 * Starts the hosted API while the visitor is still browsing the frontend.
 * This reduces the first authentication wait when the Render service is idle.
 */
export function useApiWarmup() {
  useEffect(() => {
    if (sessionStorage.getItem(WARMUP_KEY)) return;

    sessionStorage.setItem(WARMUP_KEY, "true");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);

    void fetch("/api/v1/health", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .catch(() => {
        // The request may return a CORS/404 response and still wake the host.
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);
}
