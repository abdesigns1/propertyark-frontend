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

export const buyerDashboardService = {
  async getActiveInquiryCount() {
    const { data } = await api.get<unknown>("/inquiries/my", {
      params: { page: 1, limit: 1000 },
    });

    return activeInquiryCount(data);
  },
};
