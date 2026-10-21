import type { ShortletBooking } from "@/services/shortlet-booking.service";

const STORAGE_PREFIX = "propertyark:buyer-shortlet-bookings:v1";

function storageKey(accountKey: string) {
  return `${STORAGE_PREFIX}:${accountKey}`;
}

function isStoredBooking(value: unknown): value is ShortletBooking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<ShortletBooking>;
  return (
    typeof booking.id === "string" &&
    typeof booking.propertyId === "string" &&
    typeof booking.checkIn === "string" &&
    typeof booking.checkOut === "string"
  );
}

export function getStoredBuyerBookings(accountKey: string) {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(storageKey(accountKey)) ?? "[]",
    );
    return Array.isArray(stored) ? stored.filter(isStoredBooking) : [];
  } catch {
    return [];
  }
}

export function storeBuyerBooking(
  accountKey: string,
  booking: ShortletBooking,
) {
  if (typeof window === "undefined") return;

  const bookings = getStoredBuyerBookings(accountKey).filter(
    (storedBooking) => storedBooking.id !== booking.id,
  );

  try {
    window.localStorage.setItem(
      storageKey(accountKey),
      JSON.stringify([booking, ...bookings]),
    );
  } catch {
    // The server request already succeeded; unavailable browser storage should
    // not turn a successful booking into an error for the user.
  }
}

export function replaceStoredBuyerBookings(
  accountKey: string,
  bookings: ShortletBooking[],
) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      storageKey(accountKey),
      JSON.stringify(bookings),
    );
  } catch {
    // Keep the server response usable even when browser storage is unavailable.
  }
}
