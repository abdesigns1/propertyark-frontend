import type { NextRequest } from "next/server";
import {
  API_RATE_LIMITS,
  appendRateLimitHeaders,
  checkApiRateLimit,
  rateLimitExceeded,
} from "@/lib/api-rate-limit";
import {
  isAllowedMediaContentType,
  sanitizeMediaPath,
  secureMediaHeaders,
  trustedKycRemoteObjectPath,
  trustedKycRemoteUrl,
} from "@/lib/property-media-security";
import { getBackendOrigin } from "@/lib/backend-url";

const MAX_KYC_DOCUMENT_BYTES = 10 * 1024 * 1024;

function detectedKycContentType(bytes: Uint8Array) {
  const pdfHeader = new TextDecoder("ascii").decode(bytes.slice(0, 1024));
  if (pdfHeader.includes("%PDF-")) return "application/pdf";
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
    new TextDecoder("ascii").decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder("ascii").decode(bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function isGenericBinaryContentType(value: string | null) {
  const contentType = value?.split(";", 1)[0].trim().toLowerCase();
  return (
    !contentType ||
    [
      "application/octet-stream",
      "binary/octet-stream",
      "application/download",
    ].includes(contentType)
  );
}

function roleFrom(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== "object" || depth > 4) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.role === "string") return record.role.toUpperCase();
  for (const key of ["data", "user", "profile", "result"]) {
    const role = roleFrom(record[key], depth + 1);
    if (role) return role;
  }
  return null;
}

async function isAuthorizedReviewer(authorization: string, cookie: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return false;

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/users/profile`,
      {
        headers: {
          authorization,
          ...(cookie ? { cookie } : {}),
        },
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!response.ok) return false;
    return ["ADMIN", "STAFF"].includes(roleFrom(await response.json()) ?? "");
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const rateLimit = checkApiRateLimit(
    request,
    "kyc-media",
    API_RATE_LIMITS.media,
  );
  if (!rateLimit.allowed) return rateLimitExceeded(rateLimit.headers);

  const authorization = request.headers.get("authorization") ?? "";
  const cookie = request.headers.get("cookie") ?? "";
  if (!authorization || !(await isAuthorizedReviewer(authorization, cookie))) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const requestedPath = (await params).path;
  const isRemoteDocument =
    requestedPath.length === 1 && requestedPath[0] === "remote";
  const remoteUrl = isRemoteDocument
    ? trustedKycRemoteUrl(request.nextUrl.searchParams.get("source") ?? "")
    : null;
  const safePath = isRemoteDocument ? null : sanitizeMediaPath(requestedPath);
  if ((isRemoteDocument && !remoteUrl) || (!isRemoteDocument && !safePath)) {
    return Response.json(
      { message: "A valid KYC document path is required." },
      { status: 400 },
    );
  }

  const mediaOrigin = getBackendOrigin();
  if (!remoteUrl && !mediaOrigin) {
    return Response.json(
      { message: "The backend media origin is not configured." },
      { status: 500 },
    );
  }

  const upstreamUrl =
    remoteUrl ?? new URL(`/uploads/${safePath?.join("/")}`, mediaOrigin!);
  const requestHeaders = new Headers();
  if (!remoteUrl) {
    requestHeaders.set("authorization", authorization);
    if (cookie) requestHeaders.set("cookie", cookie);
  }
  const range = request.headers.get("range");
  if (range) requestHeaders.set("range", range);

  try {
    let response = await fetch(upstreamUrl, {
      headers: requestHeaders,
      cache: "no-store",
      redirect: remoteUrl ? "follow" : "error",
    });
    let fetchedRemoteObject = Boolean(remoteUrl);

    if (remoteUrl && mediaOrigin && [401, 403].includes(response.status)) {
      const remoteObjectPath = trustedKycRemoteObjectPath(remoteUrl.toString());
      const protectedPath = remoteObjectPath
        ? sanitizeMediaPath(remoteObjectPath)
        : null;
      if (protectedPath) {
        const protectedUrl = new URL(
          `/uploads/${protectedPath.join("/")}`,
          mediaOrigin,
        );
        const protectedHeaders = new Headers({ authorization });
        if (cookie) protectedHeaders.set("cookie", cookie);
        if (range) protectedHeaders.set("range", range);
        response = await fetch(protectedUrl, {
          headers: protectedHeaders,
          cache: "no-store",
          redirect: "error",
        });
        fetchedRemoteObject = false;
      }
    }

    if (fetchedRemoteObject && !trustedKycRemoteUrl(response.url)) {
      return Response.json(
        { message: "KYC document redirected to an untrusted location." },
        { status: 502 },
      );
    }
    if (!response.ok) {
      return Response.json(
        { message: "KYC document could not be loaded." },
        { status: response.status },
      );
    }
    const upstreamContentType = response.headers.get("content-type");
    let responseBody: BodyInit | null = response.body;
    let detectedContentType: string | null = null;

    if (
      !isAllowedMediaContentType(upstreamContentType, "kyc") &&
      isGenericBinaryContentType(upstreamContentType)
    ) {
      const reportedSize = Number(response.headers.get("content-length"));
      if (
        Number.isFinite(reportedSize) &&
        reportedSize > MAX_KYC_DOCUMENT_BYTES
      ) {
        return Response.json(
          { message: "The KYC document exceeds the 10 MB limit." },
          { status: 413 },
        );
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > MAX_KYC_DOCUMENT_BYTES) {
        return Response.json(
          { message: "The KYC document exceeds the 10 MB limit." },
          { status: 413 },
        );
      }
      detectedContentType = detectedKycContentType(bytes);
      responseBody = bytes;
    }

    if (
      !isAllowedMediaContentType(upstreamContentType, "kyc") &&
      !detectedContentType
    ) {
      return Response.json(
        { message: "The KYC document type is not supported." },
        { status: 415 },
      );
    }

    const responseHeaders = secureMediaHeaders(response.headers, "kyc");
    if (detectedContentType) {
      responseHeaders.set("content-type", detectedContentType);
      if (responseBody instanceof Uint8Array) {
        responseHeaders.set("content-length", String(responseBody.byteLength));
      }
    }
    appendRateLimitHeaders(responseHeaders, rateLimit.headers);

    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "KYC document is temporarily unavailable." },
      { status: 502 },
    );
  }
}
