const SUPPORTED_BACKEND_PROTOCOLS = new Set(["http:", "https:"]);

export function getBackendOrigin() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) return null;

  try {
    const parsed = new URL(apiBaseUrl);
    return SUPPORTED_BACKEND_PROTOCOLS.has(parsed.protocol)
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}
