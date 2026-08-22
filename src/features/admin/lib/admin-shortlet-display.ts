import type {
  ShortletBooking,
  ShortletBookingStatus,
} from "@/services/shortlet-booking.service";

export function bookingReference(id: string) {
  if (id.toUpperCase().startsWith("SLB-")) return id.toUpperCase();
  const compact = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `SLB-${compact.slice(0, 4)}-${compact.slice(-5)}`;
}

export function bookingStatusLabel(status: ShortletBookingStatus) {
  return status === "COMPLETED"
    ? "Checked Out"
    : status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function bookingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function bookingDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function bookingGuests(booking: ShortletBooking) {
  const total = (booking.adults ?? 0) + (booking.children ?? 0);
  return total || 1;
}
