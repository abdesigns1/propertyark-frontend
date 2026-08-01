const COMPLETE_STATUSES = new Set([
  "VERIFIED",
  "COMPLETED",
  "APPROVED",
  "ACTIVE",
]);

export function profileInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "PA"
  );
}

export function displayProfileValue(value: string) {
  return value.trim() || "Not provided";
}

export function isVerificationComplete(status: string) {
  return COMPLETE_STATUSES.has(status.toUpperCase());
}

export function formatCompactCurrency(value: number) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatAccountAge(createdAt: string | null) {
  if (!createdAt) return "Membership date unavailable";

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    return "Membership date unavailable";
  }

  const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const years = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / millisecondsPerYear),
  );

  if (!years) return "New to PropertyArk";
  return `${years} ${years === 1 ? "year" : "years"} on PropertyArk`;
}

export function formatActivityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
