import { api } from "@/services/axios";

type UnknownRecord = Record<string, unknown>;

export interface NewsletterSubscriptionInput {
  name: string;
  email: string;
}

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function textFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function booleanFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toUpperCase();
      if (["ACTIVE", "SUBSCRIBED", "TRUE"].includes(normalized)) return true;
      if (["INACTIVE", "UNSUBSCRIBED", "FALSE"].includes(normalized)) {
        return false;
      }
    }
  }
  return null;
}

function findSubscriberArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  const queue: unknown[] = [value];
  const visited = new Set<object>();
  const collectionKeys = [
    "subscribers",
    "newsletterSubscribers",
    "subscriptions",
    "items",
    "records",
    "results",
    "data",
  ];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const source = asRecord(current);

    for (const key of collectionKeys) {
      if (Array.isArray(source[key])) return source[key];
    }

    for (const key of collectionKeys) {
      const nested = source[key];
      if (nested && typeof nested === "object") queue.push(nested);
    }
  }

  return [];
}

function normalizeSubscriber(
  value: unknown,
  fallbackId: string,
): NewsletterSubscriber {
  const source = asRecord(value);
  const unsubscribedAt = textFrom(source, [
    "unsubscribedAt",
    "unsubscribeDate",
    "removedAt",
  ]);
  const explicitActive = booleanFrom(source, [
    "isActive",
    "active",
    "isSubscribed",
    "status",
  ]);

  return {
    id:
      textFrom(source, ["id", "_id", "subscriberId", "subscriptionId"]) ??
      fallbackId,
    name: textFrom(source, ["name", "fullName", "subscriberName"]) ?? "",
    email: textFrom(source, ["email", "subscriberEmail"]) ?? "",
    isActive: explicitActive ?? !unsubscribedAt,
    subscribedAt: textFrom(source, [
      "subscribedAt",
      "createdAt",
      "subscriptionDate",
      "dateCreated",
    ]),
    unsubscribedAt,
  };
}

export const newsletterService = {
  async subscribe(input: NewsletterSubscriptionInput) {
    const response = await api.post("/newsletter/subscribe", input);
    return response.data;
  },

  async getSubscribers() {
    const response = await api.get("/newsletter/subscribers");
    return findSubscriberArray(response.data).map((item, index) =>
      normalizeSubscriber(item, `newsletter-subscriber-${index}`),
    );
  },

  async deleteSubscriber(id: string) {
    await api.delete(`/newsletter/subscribers/${id}`);
  },

  async unsubscribe(token: string, reason: string) {
    const response = await api.post(
      "/newsletter/unsubscribe",
      { reason },
      { params: { token } },
    );
    return response.data;
  },
};
