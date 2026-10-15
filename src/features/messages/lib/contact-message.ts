export function formatContactMessageDate(
  value: string | null,
  options: { includeTime?: boolean } = {},
) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(options.includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

export function contactDateValue(value: string | null) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function isContactFromLastDays(value: string | null, days: number) {
  const timestamp = contactDateValue(value);
  if (!timestamp) return false;
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

export function isContactFromToday(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
