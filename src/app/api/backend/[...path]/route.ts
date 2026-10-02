import type { NextRequest } from "next/server";
import {
  API_RATE_LIMITS,
  appendRateLimitHeaders,
  checkApiRateLimit,
  rateLimitExceeded,
} from "@/lib/api-rate-limit";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "cookie",
] as const;

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return Response.json(
      { message: "The backend API is not configured." },
      { status: 500 },
    );
  }

  const { path } = await params;
  const policy =
    request.method === "GET" || request.method === "HEAD"
      ? API_RATE_LIMITS.read
      : API_RATE_LIMITS.write;
  const rateLimit = checkApiRateLimit(
    request,
    `api-backend:${request.method}`,
    policy,
  );
  if (!rateLimit.allowed) return rateLimitExceeded(rateLimit.headers);

  const upstreamUrl = new URL(
    `${apiBaseUrl.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}`,
  );
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");
    const setCookie = upstreamResponse.headers.get("set-cookie");
    if (contentType) responseHeaders.set("content-type", contentType);
    if (setCookie) responseHeaders.set("set-cookie", setCookie);
    appendRateLimitHeaders(responseHeaders, rateLimit.headers);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        message:
          "The backend API is currently unavailable. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
