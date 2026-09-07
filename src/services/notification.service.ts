import { api } from "@/services/axios";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  actionUrl: string | null;
  actionLabel: string | null;
}

export interface NotificationPageData {
  notifications: AdminNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminNotificationStats {
  unread: number;
  critical: number;
}

export interface AdminNotificationPayload {
  title: string;
  message: string;
  type: "GENERAL";
  channel: "IN_APP" | "EMAIL" | "BOTH";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface AdminBulkNotificationPayload extends AdminNotificationPayload {
  target: "ALL" | "VENDOR" | "USER" | "STAFF" | "SPECIFIC";
  userIds?: string[];
}

export interface AdminSingleNotificationPayload extends AdminNotificationPayload {
  userId: string;
}

// Keep admin sends on the application's origin. The API currently allows only
// selected browser origins, so direct calls can fail before Axios receives the
// backend's response body.
const ADMIN_NOTIFICATION_PROXY_BASE_URL = "/api/backend";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(source: UnknownRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

function numeric(source: UnknownRecord, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = Number(source[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

function normalizeNotification(
  value: unknown,
  fallbackId: string,
): AdminNotification {
  const source = asRecord(value);
  const metadata = {
    ...asRecord(source.metadata),
    ...asRecord(source.data),
  };
  const id = text(
    source,
    ["id", "_id", "notificationId"],
    text(metadata, ["id", "_id", "notificationId"]),
  );

  return {
    id: id || fallbackId,
    title: text(
      source,
      ["title", "subject"],
      text(metadata, ["title", "subject"], "Platform notification"),
    ),
    message: text(
      source,
      ["message", "body", "description"],
      text(metadata, ["message", "body", "description"]),
    ),
    type: text(
      source,
      ["type", "category", "notificationType", "eventType"],
      text(
        metadata,
        ["type", "category", "notificationType", "eventType"],
        "GENERAL",
      ),
    ).toUpperCase(),
    priority: text(
      source,
      ["priority", "severity"],
      text(metadata, ["priority", "severity"], "NORMAL"),
    ).toUpperCase(),
    isRead:
      source.isRead === true ||
      source.read === true ||
      Boolean(source.readAt ?? source.seenAt) ||
      metadata.isRead === true ||
      metadata.read === true ||
      Boolean(metadata.readAt ?? metadata.seenAt),
    createdAt: text(
      source,
      ["createdAt", "sentAt", "timestamp", "updatedAt"],
      text(
        metadata,
        ["createdAt", "sentAt", "timestamp", "updatedAt"],
        new Date().toISOString(),
      ),
    ),
    actionUrl:
      text(source, ["redirect", "actionUrl"], text(metadata, ["redirect"])) ||
      null,
    actionLabel:
      text(source, ["actionLabel"], text(metadata, ["actionLabel"])) || null,
  };
}

function getMine(page = 1, limit = 20) {
  return api
    .get<unknown>("/notifications/my", { params: { page, limit } })
    .then(({ data }) => unwrapNotifications(data));
}

async function getAllMine(limit = 100) {
  const firstPage = await getMine(1, limit);
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(0, firstPage.pagination.pages - 1) },
      (_, index) => getMine(index + 2, limit),
    ),
  );
  const notifications = [
    ...firstPage.notifications,
    ...remainingPages.flatMap((page) => page.notifications),
  ];

  return {
    notifications,
    pagination: {
      page: 1,
      limit: notifications.length || limit,
      total: firstPage.pagination.total,
      pages: 1,
    },
  } satisfies NotificationPageData;
}

function unwrapNotifications(value: unknown): NotificationPageData {
  const rows = findNotificationRows(value);
  const pagination = findPagination(value);
  const notifications = rows.map((item, index) => {
    const source = asRecord(item);
    const fallbackId = [
      text(source, ["type", "category"], "notification"),
      text(source, ["createdAt", "sentAt", "timestamp"], "unknown-date"),
      index,
    ].join("-");
    return normalizeNotification(item, fallbackId);
  });
  const limit = numeric(pagination, ["limit", "pageSize"], 20);
  const total = numeric(
    pagination,
    ["total", "totalItems"],
    notifications.length,
  );

  return {
    notifications,
    pagination: {
      page: numeric(pagination, ["page", "currentPage"], 1),
      limit,
      total,
      pages: numeric(
        pagination,
        ["pages", "totalPages"],
        Math.max(1, Math.ceil(total / limit)),
      ),
    },
  };
}

function findNotificationRows(value: unknown): unknown[] {
  const queue: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  const visited = new Set<object>();
  const collectionKeys = [
    "notifications",
    "items",
    "records",
    "results",
    "docs",
    "rows",
    "data",
  ];

  while (queue.length) {
    const current = queue.shift();
    if (!current || current.depth > 6) continue;
    if (Array.isArray(current.value)) return current.value;
    if (!current.value || typeof current.value !== "object") continue;
    if (visited.has(current.value)) continue;
    visited.add(current.value);

    const source = asRecord(current.value);
    for (const key of collectionKeys) {
      const candidate = source[key];
      if (Array.isArray(candidate)) return candidate;
    }
    for (const key of collectionKeys) {
      const candidate = source[key];
      if (candidate && typeof candidate === "object") {
        queue.push({ value: candidate, depth: current.depth + 1 });
      }
    }
  }

  return [];
}

function findPagination(value: unknown) {
  const queue: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  const visited = new Set<object>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || current.depth > 6) continue;
    if (!current.value || typeof current.value !== "object") continue;
    if (visited.has(current.value)) continue;
    visited.add(current.value);

    const source = asRecord(current.value);
    const pagination = source.pagination ?? source.meta;
    if (pagination && typeof pagination === "object") {
      return asRecord(pagination);
    }
    for (const key of ["data", "notifications", "result", "payload"]) {
      const candidate = source[key];
      if (candidate && typeof candidate === "object") {
        queue.push({ value: candidate, depth: current.depth + 1 });
      }
    }
  }

  return {};
}

function unwrapStats(value: unknown): AdminNotificationStats {
  return {
    unread: nestedNumeric(value, ["unread", "unreadCount", "totalUnread"]) ?? 0,
    critical:
      nestedNumeric(value, [
        "critical",
        "criticalCount",
        "urgent",
        "urgentCount",
      ]) ?? 0,
  };
}

function nestedNumeric(value: unknown, keys: string[]) {
  const expected = new Set(keys.map((key) => key.toLowerCase()));
  const queue: unknown[] = [value];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;

    for (const [key, candidate] of Object.entries(asRecord(current))) {
      if (expected.has(key.toLowerCase())) {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
      }
      if (candidate && typeof candidate === "object") queue.push(candidate);
    }
  }

  return undefined;
}

export const notificationService = {
  getMine,
  getAllMine,

  getAdminStats: () =>
    api
      .get<unknown>("/notifications/admin/stats")
      .then(({ data }) => unwrapStats(data)),

  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () => api.patch("/notifications/read/all"),

  sendBulk: (payload: AdminBulkNotificationPayload) =>
    api.post("/notifications/admin/send-bulk", payload, {
      baseURL: ADMIN_NOTIFICATION_PROXY_BASE_URL,
    }),

  sendToUser: (payload: AdminSingleNotificationPayload) =>
    api.post("/notifications/admin/send-user", payload, {
      baseURL: ADMIN_NOTIFICATION_PROXY_BASE_URL,
    }),
};
