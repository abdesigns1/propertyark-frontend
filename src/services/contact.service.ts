import axios from "axios";
import { api } from "@/services/axios";

type UnknownRecord = Record<string, unknown>;

export interface CreateContactMessageInput {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string | null;
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

function findContactArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  const queue: unknown[] = [value];
  const visited = new Set<object>();
  const collectionKeys = [
    "contacts",
    "contactMessages",
    "messages",
    "requests",
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

function findSingleContact(value: unknown): UnknownRecord {
  let current = asRecord(value);
  const keys = ["data", "contact", "contactMessage", "message", "result"];

  for (let depth = 0; depth < 5; depth += 1) {
    const nested = keys
      .map((key) => current[key])
      .find((item) => Object.keys(asRecord(item)).length > 0);
    if (!nested) break;
    current = asRecord(nested);
  }

  return current;
}

function normalizeContact(
  value: unknown,
  fallbackId = "contact-message",
): ContactMessage {
  const source = asRecord(value);

  return {
    id: textFrom(source, ["id", "_id", "contactId", "messageId"]) ?? fallbackId,
    fullName:
      textFrom(source, ["fullName", "name", "senderName", "customerName"]) ??
      "",
    email: textFrom(source, ["email", "senderEmail", "contactEmail"]) ?? "",
    subject: textFrom(source, ["subject", "title", "topic"]) ?? "",
    message:
      textFrom(source, ["message", "body", "content", "description"]) ?? "",
    createdAt: textFrom(source, [
      "createdAt",
      "submittedAt",
      "receivedAt",
      "dateCreated",
    ]),
  };
}

async function getAllContacts() {
  const response = await api.get("/contacts");
  return findContactArray(response.data).map((item, index) =>
    normalizeContact(item, `contact-message-${index}`),
  );
}

export const contactService = {
  async create(input: CreateContactMessageInput) {
    const response = await api.post("/contacts", input);
    return response.data;
  },

  getAll: getAllContacts,

  async getById(id: string) {
    try {
      const response = await api.get(`/contacts/${id}`);
      return normalizeContact(findSingleContact(response.data), id);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }

      const contacts = await getAllContacts();
      const contact = contacts.find((item) => item.id === id);
      if (contact) return contact;

      throw error;
    }
  },

  async deleteById(id: string) {
    await api.delete(`/contacts/${id}`);
  },
};
