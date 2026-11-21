import type { NextRequest } from "next/server";
import {
  API_RATE_LIMITS,
  appendRateLimitHeaders,
  checkApiRateLimit,
  rateLimitExceeded,
} from "@/lib/api-rate-limit";
import {
  secureMediaHeaders,
  trustedPropertyArkStorageUrl,
} from "@/lib/property-media-security";

const MAX_PROPERTY_DOCUMENT_BYTES = 10 * 1024 * 1024;
const DOCUMENT_URL_KEYS = [
  "signedUrl",
  "presignedUrl",
  "preSignedUrl",
  "downloadUrl",
  "secureUrl",
  "fileUrl",
  "url",
  "location",
] as const;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function roleFrom(value: unknown, depth = 0): string | null {
  if (depth > 4) return null;
  const source = record(value);
  if (typeof source.role === "string") return source.role.toUpperCase();
  for (const key of ["data", "user", "profile", "result"]) {
    const role = roleFrom(source[key], depth + 1);
    if (role) return role;
  }
  return null;
}

function documentUrlFrom(value: unknown, depth = 0): string | null {
  if (depth > 6) return null;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = documentUrlFrom(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const source = record(value);
  for (const key of DOCUMENT_URL_KEYS) {
    const candidate = source[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  for (const candidate of Object.values(source)) {
    if (!candidate || typeof candidate !== "object") continue;
    const found = documentUrlFrom(candidate, depth + 1);
    if (found) return found;
  }
  return null;
}

function detectedDocumentContentType(bytes: Uint8Array) {
  const header = new TextDecoder("ascii").decode(bytes.slice(0, 1024));
  if (header.includes("%PDF-")) return "application/pdf";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    header.slice(0, 4) === "RIFF" &&
    new TextDecoder("ascii").decode(bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function trustedBackendUploadUrl(input: string, apiBaseUrl: string) {
  try {
    const backend = new URL(apiBaseUrl);
    const parsed = new URL(input, backend.origin);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== backend.origin ||
      !parsed.pathname.startsWith("/uploads/") ||
      parsed.username ||
      parsed.password ||
      parsed.hash
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function isAuthorizedReviewer(
  apiBaseUrl: string,
  authorization: string,
  cookie: string,
) {
  try {
    const response = await fetch(`${apiBaseUrl}/users/profile`, {
      headers: {
        authorization,
        ...(cookie ? { cookie } : {}),
      },
      cache: "no-store",
      redirect: "error",
    });
    return (
      response.ok &&
      ["ADMIN", "STAFF"].includes(roleFrom(await response.json()) ?? "")
    );
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const rateLimit = checkApiRateLimit(
    request,
    "property-document",
    API_RATE_LIMITS.media,
  );
  if (!rateLimit.allowed) return rateLimitExceeded(rateLimit.headers);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  const authorization = request.headers.get("authorization") ?? "";
  const cookie = request.headers.get("cookie") ?? "";
  const { mediaId } = await params;
  if (!apiBaseUrl || !authorization) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(mediaId)) {
    return Response.json(
      { message: "A valid property document ID is required." },
      { status: 400 },
    );
  }
  if (!(await isAuthorizedReviewer(apiBaseUrl, authorization, cookie))) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const authenticatedHeaders = new Headers({ authorization });
  if (cookie) authenticatedHeaders.set("cookie", cookie);

  try {
    let response = await fetch(
      `${apiBaseUrl}/properties/media/${encodeURIComponent(mediaId)}`,
      {
        headers: authenticatedHeaders,
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!response.ok) {
      return Response.json(
        { message: "Property document access could not be created." },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.toLowerCase().includes("application/json")) {
      const source = documentUrlFrom(await response.json());
      if (!source) {
        return Response.json(
          {
            message:
              "The property media response did not include a document URL.",
          },
          { status: 502 },
        );
      }

      const storageUrl = trustedPropertyArkStorageUrl(source);
      const backendUploadUrl = trustedBackendUploadUrl(source, apiBaseUrl);
      const documentUrl = storageUrl ?? backendUploadUrl;
      if (!documentUrl) {
        return Response.json(
          {
            message: "The property document URL is not from a trusted source.",
          },
          { status: 502 },
        );
      }

      response = await fetch(documentUrl, {
        headers: backendUploadUrl ? authenticatedHeaders : undefined,
        cache: "no-store",
        redirect: storageUrl ? "follow" : "error",
      });
      if (storageUrl && !trustedPropertyArkStorageUrl(response.url)) {
        return Response.json(
          { message: "Property document redirected to an untrusted source." },
          { status: 502 },
        );
      }
    }

    if (!response.ok) {
      return Response.json(
        {
          message:
            response.status === 401 || response.status === 403
              ? "The backend did not provide authorized access to this property document."
              : "Property document could not be loaded.",
        },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const reportedSize = Number(response.headers.get("content-length"));
    if (
      Number.isFinite(reportedSize) &&
      reportedSize > MAX_PROPERTY_DOCUMENT_BYTES
    ) {
      return Response.json(
        { message: "The property document exceeds the 10 MB limit." },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_PROPERTY_DOCUMENT_BYTES) {
      return Response.json(
        { message: "The property document exceeds the 10 MB limit." },
        { status: 413 },
      );
    }
    const verifiedContentType = detectedDocumentContentType(bytes);
    if (!verifiedContentType) {
      return Response.json(
        { message: "The property document is not a supported PDF or image." },
        { status: 415 },
      );
    }

    const headers = secureMediaHeaders(response.headers, "kyc");
    headers.set("content-type", verifiedContentType);
    headers.set("content-length", String(bytes.byteLength));
    appendRateLimitHeaders(headers, rateLimit.headers);
    return new Response(bytes, { status: 200, headers });
  } catch {
    return Response.json(
      { message: "Property document is temporarily unavailable." },
      { status: 502 },
    );
  }
}
