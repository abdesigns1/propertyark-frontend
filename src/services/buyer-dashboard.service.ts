import { api } from "@/services/axios";

type UnknownRecord = Record<string, unknown>;

const INACTIVE_INQUIRY_STATUSES = new Set([
  "CANCELLED",
  "CANCELED",
  "CLOSED",
  "COMPLETED",
  "DECLINED",
  "REJECTED",
]);

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function inquiryRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  const root = asRecord(value);
  if (Array.isArray(root.data)) return root.data;

  const data = asRecord(root.data);
  for (const key of ["inquiries", "items", "results", "records"]) {
    if (Array.isArray(data[key])) return data[key];
    if (Array.isArray(root[key])) return root[key];
  }

  return [];
}

function activeInquiryCount(value: unknown) {
  return inquiryRows(value).filter((item) => {
    const status = asRecord(item).status;
    if (typeof status !== "string") return true;
    return !INACTIVE_INQUIRY_STATUSES.has(status.toUpperCase());
  }).length;
}

function text(source: UnknownRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function findActivityRows(value: unknown): unknown[] {
  const queue: unknown[] = [value];
  const activityKeys = new Set([
    "recentActivities",
    "recentActivity",
    "activities",
    "activity",
  ]);

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    const source = asRecord(current);
    for (const [key, candidate] of Object.entries(source)) {
      if (activityKeys.has(key) && Array.isArray(candidate)) return candidate;
      if (candidate && typeof candidate === "object") queue.push(candidate);
    }
  }

  return [];
}

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeActivities(value: unknown) {
  return findActivityRows(value)
    .slice(0, 6)
    .map((item) => {
      const source = asRecord(item);
      const type = text(source, ["type", "action", "eventType", "category"]);
      const createdAt = text(source, [
        "createdAt",
        "timestamp",
        "date",
        "updatedAt",
      ]);
      return {
        title: text(
          source,
          ["title", "name", "actionLabel"],
          type || "Account activity",
        ),
        time: relativeTime(createdAt),
        text: text(
          source,
          ["message", "description", "details", "summary"],
          "Your account activity was updated.",
        ),
        color: /inspection|inquiry|viewing/i.test(type)
          ? "bg-primary"
          : /payment|escrow|purchase|booking/i.test(type)
            ? "bg-secondary"
            : "bg-muted-foreground",
      };
    });
}

function recentlyViewedPropertyIds(value: unknown) {
  const ids: string[] = [];
  for (const item of findActivityRows(value)) {
    const source = asRecord(item);
    const metadata = asRecord(
      source.metadata ?? source.data ?? source.details ?? source.payload,
    );
    const property = asRecord(source.property ?? metadata.property);
    const action = text(source, ["action", "type", "eventType", "title"]);
    const entityType = text(source, ["entityType", "resourceType", "category"]);
    const isPropertyView =
      /view(?:ed)?[_\s-]*property|property[_\s-]*view/i.test(action) ||
      (/view/i.test(action) && /property/i.test(entityType));
    if (!isPropertyView) continue;

    const propertyId =
      text(source, ["propertyId", "entityId", "resourceId", "subjectId"]) ||
      text(metadata, ["propertyId", "entityId", "resourceId"]) ||
      text(property, ["id", "_id"]);
    if (propertyId && !ids.includes(propertyId)) ids.push(propertyId);
  }
  return ids;
}

export const buyerDashboardService = {
  async getActiveInquiryCount() {
    const { data } = await api.get<unknown>("/inquiries/my", {
      params: { page: 1, limit: 1000 },
    });

    return activeInquiryCount(data);
  },
  async getRecentActivities() {
    const { data } = await api.get<unknown>("/users/dashboard");
    return normalizeActivities(data);
  },
  async getRecentlyViewedPropertyIds() {
    const { data } = await api.get<unknown>("/users/dashboard");
    return recentlyViewedPropertyIds(data);
  },
};
