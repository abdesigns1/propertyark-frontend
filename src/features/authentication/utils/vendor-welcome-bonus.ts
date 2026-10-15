import { activeSiteAnnouncement } from "@/config/site-announcement";

const PENDING_VENDOR_WELCOME_KEY =
  "propertyark:vendor-welcome-bonus:pending:v1";

interface PendingVendorWelcome {
  campaignId: string;
  email: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readPendingWelcome(): PendingVendorWelcome | null {
  if (typeof window === "undefined") return null;

  try {
    const value = JSON.parse(
      window.localStorage.getItem(PENDING_VENDOR_WELCOME_KEY) ?? "null",
    ) as PendingVendorWelcome | null;

    return value?.campaignId && value.email ? value : null;
  } catch {
    return null;
  }
}

export function markVendorWelcomeBonusPending(email: string) {
  if (
    typeof window === "undefined" ||
    !activeSiteAnnouncement.enabled ||
    !activeSiteAnnouncement.showVendorWelcomeModal
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      PENDING_VENDOR_WELCOME_KEY,
      JSON.stringify({
        campaignId: activeSiteAnnouncement.id,
        email: normalizeEmail(email),
      } satisfies PendingVendorWelcome),
    );
  } catch {
    // Registration should still complete when browser storage is unavailable.
  }
}

export function hasPendingVendorWelcomeBonus(email: string | null) {
  if (
    !email ||
    !activeSiteAnnouncement.enabled ||
    !activeSiteAnnouncement.showVendorWelcomeModal
  ) {
    return false;
  }

  const pending = readPendingWelcome();
  return (
    pending?.campaignId === activeSiteAnnouncement.id &&
    pending.email === normalizeEmail(email)
  );
}

export function consumeVendorWelcomeBonus(email: string | null) {
  if (!email || typeof window === "undefined") return;

  const pending = readPendingWelcome();
  if (pending?.email !== normalizeEmail(email)) return;

  try {
    window.localStorage.removeItem(PENDING_VENDOR_WELCOME_KEY);
  } catch {
    // The modal can still close when browser storage is unavailable.
  }
}
