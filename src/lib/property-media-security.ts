import { getBackendOrigin } from "@/lib/backend-url";

const PROPERTY_MEDIA_PREFIX = "/api/property-media/";
const KYC_MEDIA_PREFIX = "/api/kyc-media/";
const KYC_REMOTE_MEDIA_PATH = `${KYC_MEDIA_PREFIX}remote`;

const PROPERTY_MEDIA_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const KYC_MEDIA_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type MediaPurpose = "property" | "kyc";

function fullyDecode(value: string) {
  let decoded = value;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decodeURIComponent(decoded);
    if (next === decoded) return decoded;
    decoded = next;
  }
  // Reject values that remain encoded after several passes. This prevents a
  // downstream server from revealing a new path separator or dot segment.
  if (decodeURIComponent(decoded) !== decoded) return null;
  return decoded;
}

function safeSegment(value: string) {
  try {
    const decoded = fullyDecode(value);
    if (
      !decoded ||
      decoded === "." ||
      decoded === ".." ||
      decoded.includes("/") ||
      decoded.includes("\\") ||
      /[\u0000-\u001f\u007f]/.test(decoded)
    ) {
      return null;
    }
    return encodeURIComponent(decoded);
  } catch {
    return null;
  }
}

export function sanitizeMediaPath(path: readonly string[]) {
  if (!path.length) return null;
  const sanitized = path.map(safeSegment);
  return sanitized.every((segment): segment is string => Boolean(segment))
    ? sanitized
    : null;
}

/**
 * Accept only PropertyArk-owned S3 objects for the protected KYC viewer. The
 * complete URL is revalidated again by the server-side proxy before fetching.
 */
export function trustedKycRemoteUrl(input: string) {
  try {
    const parsed = new URL(input.trim());
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      parsed.hash
    ) {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    const virtualHosted = hostname.match(
      /^([a-z0-9][a-z0-9.-]*)\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/,
    );
    const pathHosted = hostname.match(
      /^s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/,
    );
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    const bucket = virtualHosted?.[1] ?? (pathHosted ? pathSegments[0] : null);
    const objectSegments = virtualHosted ? pathSegments : pathSegments.slice(1);

    if (
      !bucket?.toLowerCase().startsWith("propertyark") ||
      objectSegments.length === 0 ||
      objectSegments.some((segment) => segment === "." || segment === "..")
    ) {
      return null;
    }

    for (const key of parsed.searchParams.keys()) {
      if (
        !key.toLowerCase().startsWith("x-amz-") &&
        ![
          "x-id",
          "response-content-disposition",
          "response-content-type",
        ].includes(key.toLowerCase())
      ) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function trustedKycRemoteObjectPath(input: string) {
  const parsed = trustedKycRemoteUrl(input);
  if (!parsed) return null;

  const isPathHosted = /^s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/i.test(
    parsed.hostname,
  );
  const path = parsed.pathname.split("/").filter(Boolean);
  return isPathHosted ? path.slice(1) : path;
}

function proxyUrl(pathname: string, purpose: MediaPurpose) {
  const path = sanitizeMediaPath(pathname.split("/"));
  if (!path) return null;
  const prefix = purpose === "kyc" ? KYC_MEDIA_PREFIX : PROPERTY_MEDIA_PREFIX;
  return `${prefix}${path.join("/")}`;
}

/**
 * Converts only PropertyArk upload URLs into a local proxy URL. Unknown
 * origins, schemes, credentials, ports, query strings, and fragments fail
 * closed instead of reaching a privileged document viewer.
 */
export function trustedUploadProxyUrl(input: string, purpose: MediaPurpose) {
  const value = input.trim();
  if (!value) return null;

  const expectedPrefix =
    purpose === "kyc" ? KYC_MEDIA_PREFIX : PROPERTY_MEDIA_PREFIX;
  const conflictingPrefix =
    purpose === "kyc" ? PROPERTY_MEDIA_PREFIX : KYC_MEDIA_PREFIX;
  if (value.startsWith(conflictingPrefix)) return null;
  if (value.startsWith(expectedPrefix)) {
    return proxyUrl(value.slice(expectedPrefix.length), purpose);
  }

  const relativeMatch = value.match(/^\/?uploads\/(.+)$/);
  if (relativeMatch && !value.includes("?") && !value.includes("#")) {
    return proxyUrl(relativeMatch[1], purpose);
  }

  try {
    const parsed = new URL(value);
    const mediaOrigin = getBackendOrigin();
    const configuredMediaUrl = mediaOrigin ? new URL(mediaOrigin) : null;
    const matchesConfiguredOrigin = Boolean(
      configuredMediaUrl &&
      (parsed.origin === configuredMediaUrl.origin ||
        (configuredMediaUrl.protocol === "https:" &&
          parsed.protocol === "http:" &&
          parsed.hostname === configuredMediaUrl.hostname &&
          !parsed.port)),
    );
    if (
      matchesConfiguredOrigin &&
      ["http:", "https:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password &&
      !parsed.search &&
      !parsed.hash &&
      parsed.pathname.startsWith("/uploads/")
    ) {
      // The browser receives a same-origin proxy URL; the server-side proxy
      // uses the exact backend origin configured for this environment.
      return proxyUrl(parsed.pathname.slice("/uploads/".length), purpose);
    }

    const remoteKycUrl = purpose === "kyc" ? trustedKycRemoteUrl(value) : null;
    if (remoteKycUrl) {
      return `${KYC_REMOTE_MEDIA_PATH}?source=${encodeURIComponent(remoteKycUrl.toString())}`;
    }

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.hash
    ) {
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Keeps ordinary external/avatar URLs intact, while routing PropertyArk
 * uploads through the same-origin media endpoint. The backend serves uploads
 * with a same-origin response policy, so browsers cannot embed them directly.
 */
export function normalizeAvatarMediaUrl(input: string) {
  return trustedUploadProxyUrl(input, "property") ?? input;
}

export function isAllowedMediaContentType(
  contentType: string | null,
  purpose: MediaPurpose,
) {
  const mime = contentType?.split(";", 1)[0].trim().toLowerCase();
  if (!mime) return false;
  return (purpose === "kyc" ? KYC_MEDIA_TYPES : PROPERTY_MEDIA_TYPES).has(mime);
}

export function secureMediaHeaders(upstream: Headers, purpose: MediaPurpose) {
  const headers = new Headers();
  for (const name of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    const value = upstream.get(name);
    if (value) headers.set(name, value);
  }
  headers.set(
    "cache-control",
    purpose === "kyc" ? "private, no-store, max-age=0" : "public, max-age=3600",
  );
  headers.set("content-disposition", "inline");
  headers.set("content-security-policy", "default-src 'none'; sandbox");
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("referrer-policy", "no-referrer");
  headers.set("x-content-type-options", "nosniff");
  return headers;
}
