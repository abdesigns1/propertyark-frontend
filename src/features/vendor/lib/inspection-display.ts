import type { VendorInspection } from "@/services/inspection.service";

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Confirmed",
  CONFIRMED: "Confirmed",
  SCHEDULED: "Scheduled",
  PENDING: "Pending",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  REJECTED: "Declined",
  CANCELLED: "Cancelled",
};

const STAT_TONES: Record<string, string> = {
  blue: "bg-primary/10 text-primary",
  orange: "bg-secondary/10 text-secondary",
  green: "bg-success/10 text-success",
  red: "bg-destructive/10 text-destructive",
  brown: "bg-warning/10 text-warning",
};

/** Normalizes the different meeting-type spellings returned by the API. */
export function normalizeMeetingType(value: string | null) {
  const normalized = value?.toUpperCase() ?? "";
  return normalized.includes("VIDEO") || normalized.includes("VIRTUAL")
    ? "virtual"
    : "physical";
}

export function formatMeetingType(value: string | null) {
  return normalizeMeetingType(value) === "virtual" ? "Virtual" : "Physical";
}

export function inspectionCode(inspection: VendorInspection) {
  // Prefer a backend-issued inspection reference when one is available.
  if (inspection.propertyReference?.toUpperCase().startsWith("INS-")) {
    return inspection.propertyReference;
  }

  const suffix = inspection.id
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-10)
    .toUpperCase();
  return `INS-${suffix}`;
}

export function nameInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function parseInspectionDate(value: string) {
  // Returning null gives every caller one consistent invalid-date fallback path.
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatShortDate(value: string) {
  const date = parseInspectionDate(value);
  return date
    ? new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    : "Date not set";
}

export function formatInspectionTime(inspection: VendorInspection) {
  if (inspection.time) return inspection.time;

  const date = parseInspectionDate(inspection.inspectionDate);
  return date
    ? new Intl.DateTimeFormat("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date)
    : "Time not set";
}

export function formatTimelineDate(value: string) {
  const date = parseInspectionDate(value);
  return date
    ? new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date)
    : "Not recorded";
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function nearestInspectionDate(inspections: VendorInspection[]) {
  // Seed the calendar near the most relevant inspection instead of an empty month.
  const now = Date.now();
  return inspections
    .map((inspection) => parseInspectionDate(inspection.inspectionDate))
    .filter((date): date is Date => Boolean(date))
    .sort(
      (first, second) =>
        Math.abs(first.getTime() - now) - Math.abs(second.getTime() - now),
    )[0];
}

export function calendarDays(month: Date) {
  const first = monthStart(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  // Calendar grids need either five or six complete Sunday-to-Saturday rows.
  const cellCount = first.getDay() + last.getDate() > 35 ? 42 : 35;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function isSameDay(first: Date, second: Date) {
  return dateKey(first) === dateKey(second);
}

export function calendarEventTone(status: string) {
  if (["DECLINED", "REJECTED", "CANCELLED"].includes(status)) {
    return "border-destructive bg-destructive/10 text-destructive";
  }
  if (status === "PENDING") {
    return "border-secondary bg-secondary/10 text-secondary";
  }
  if (status === "COMPLETED") {
    return "border-success bg-success/10 text-success";
  }
  return "border-primary bg-primary/10 text-primary";
}

export function statTone(tone: string) {
  return STAT_TONES[tone];
}
