const RECENTLY_VIEWED_PREFIX = "propertyark:recently-viewed";
const MAX_RECENT_PROPERTIES = 20;

function storageKey(accountKey: string) {
  return `${RECENTLY_VIEWED_PREFIX}:${accountKey}`;
}

export function getRecentlyViewedPropertyIds(accountKey: string) {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(
      window.localStorage.getItem(storageKey(accountKey)) ?? "[]",
    );
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewedProperty(
  accountKey: string,
  propertyId: string,
) {
  const ids = getRecentlyViewedPropertyIds(accountKey).filter(
    (id) => id !== propertyId,
  );
  window.localStorage.setItem(
    storageKey(accountKey),
    JSON.stringify([propertyId, ...ids].slice(0, MAX_RECENT_PROPERTIES)),
  );
}
