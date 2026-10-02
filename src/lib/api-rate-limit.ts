import type { NextRequest } from "next/server";

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const MAX_TRACKED_CLIENTS = 10_000;
const globalRateLimit = globalThis as typeof globalThis & {
  propertyArkRateLimitStore?: RateLimitStore;
};

const store =
  globalRateLimit.propertyArkRateLimitStore ??
  (globalRateLimit.propertyArkRateLimitStore = new Map());

export const API_RATE_LIMITS = {
  auth: { limit: 10, windowMs: 60_000 },
  read: { limit: 240, windowMs: 60_000 },
  write: { limit: 60, windowMs: 60_000 },
  media: { limit: 180, windowMs: 60_000 },
} satisfies Record<string, RateLimitPolicy>;

function clientAddress(request: NextRequest) {
  const forwardedFor =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function checkApiRateLimit(
  request: NextRequest,
  namespace: string,
  policy: RateLimitPolicy,
) {
  const now = Date.now();
  const key = `${namespace}:${clientAddress(request)}`;
  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    if (store.size >= MAX_TRACKED_CLIENTS) pruneExpiredEntries(now);
    if (store.size >= MAX_TRACKED_CLIENTS) {
      const oldestKey = store.keys().next().value as string | undefined;
      if (oldestKey) store.delete(oldestKey);
    }
    entry = { count: 0, resetAt: now + policy.windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, policy.limit - entry.count);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((entry.resetAt - now) / 1_000),
  );

  return {
    allowed: entry.count <= policy.limit,
    headers: {
      "RateLimit-Limit": String(policy.limit),
      "RateLimit-Remaining": String(remaining),
      "RateLimit-Reset": String(Math.ceil(entry.resetAt / 1_000)),
      ...(entry.count > policy.limit
        ? { "Retry-After": String(retryAfterSeconds) }
        : {}),
    },
  };
}

export function rateLimitExceeded(headers: Record<string, string>) {
  return Response.json(
    { message: "Too many requests. Please try again shortly." },
    { status: 429, headers },
  );
}

export function appendRateLimitHeaders(
  headers: Headers,
  rateLimitHeaders: Record<string, string>,
) {
  for (const [name, value] of Object.entries(rateLimitHeaders)) {
    headers.set(name, value);
  }
}
