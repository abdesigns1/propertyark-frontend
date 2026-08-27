const MEDIA_HOST = "propertyark-backend.onrender.com";
const PROPERTY_MEDIA_PREFIX = "/api/property-media/";
const KYC_MEDIA_PREFIX = "/api/kyc-media/";

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
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.hostname !== MEDIA_HOST ||
      parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      !parsed.pathname.startsWith("/uploads/")
    ) {
      return null;
    }
    // Legacy API records may contain HTTP upload URLs. They are never fetched
    // over HTTP: the returned local proxy always connects to the fixed HTTPS
    // media origin, safely upgrading those records at the trust boundary.
    return proxyUrl(parsed.pathname.slice("/uploads/".length), purpose);
  } catch {
    return null;
  }
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
