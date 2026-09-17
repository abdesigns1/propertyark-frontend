import type { NextRequest } from "next/server";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "cookie",
] as const;

function cookieForFrontendOrigin(cookie: string) {
  const parts = cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.toLowerCase().startsWith("domain="))
    .map((part) => (part.toLowerCase().startsWith("path=") ? "Path=/" : part));
  if (!parts.some((part) => part.toLowerCase().startsWith("path="))) {
    parts.push("Path=/");
  }
  return parts.join("; ");
}

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
      signal: request.signal,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);
    const cookieHeaders = upstreamResponse.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies =
      cookieHeaders.getSetCookie?.() ??
      (upstreamResponse.headers.get("set-cookie")
        ? [upstreamResponse.headers.get("set-cookie")!]
        : []);
    setCookies.forEach((cookie) =>
      responseHeaders.append("set-cookie", cookieForFrontendOrigin(cookie)),
    );

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
