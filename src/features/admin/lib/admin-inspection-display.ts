import type { VendorInspection } from "@/services/inspection.service";

export function inspectionReference(id: string) {
  const compact = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return id.toUpperCase().startsWith("INS-")
    ? id.toUpperCase()
    : `INS-${compact.slice(0, 4)}-${compact.slice(-5)}`;
}

export function inspectionTypeLabel(value: string | null) {
  if (!value) return "Physical Inspection";
  return value === "VIDEO_CALL"
    ? "Virtual Tour"
    : value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function inspectionStatusLabel(status: string) {
  const normalized = status.toUpperCase();
  if (["PENDING", "REQUESTED"].includes(normalized)) return "Requested";
  if (["ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(normalized)) {
    return "Scheduled";
  }
  if (normalized === "COMPLETED") return "Completed";
  if (["ISSUE_REPORTED", "DISPUTED"].includes(normalized)) {
    return "Issue Reported";
  }
  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
}

export function inspectionDateLabel(value: string) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function inspectionTimeLabel(inspection: VendorInspection) {
  if (inspection.time) return inspection.time;
  if (!inspection.inspectionDate) return "Time pending";
  const date = new Date(inspection.inspectionDate);
  if (Number.isNaN(date.getTime())) return "Time pending";
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
