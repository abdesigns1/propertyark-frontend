import type { AxiosProgressEvent } from "axios";
import { api } from "@/services/axios";

export type VendorKycStatus =
  "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface VendorKycState {
  status: VendorKycStatus;
  rejectionReason: string | null;
  hasDocument: boolean;
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function firstRecord(...values: unknown[]) {
  return values.map(record).find((value) => Object.keys(value).length) ?? {};
}

function text(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function normalizeKycState(value: unknown): VendorKycState {
  const root = record(value);
  const data = record(root.data);
  const source = firstRecord(data.user, data.profile, data, root);
  const documentUrl = text(source, [
    "ninPhoto",
    "ninPhotoUrl",
    "ninDocument",
    "ninDocumentUrl",
    "documentUrl",
  ]);
  const rawStatus = text(source, [
    "ninVerificationStatus",
    "ninStatus",
    "identityVerificationStatus",
    "verificationStatus",
  ])?.toUpperCase();
  const status = ["VERIFIED", "REJECTED"].includes(rawStatus ?? "")
    ? (rawStatus as VendorKycStatus)
    : rawStatus === "PENDING" && documentUrl
      ? "PENDING"
      : "NOT_SUBMITTED";

  return {
    status,
    rejectionReason: text(source, ["ninRejectionReason", "rejectionReason"]),
    hasDocument: Boolean(documentUrl),
  };
}

export const vendorKycService = {
  getStatus: async () =>
    normalizeKycState((await api.get("/users/profile")).data),

  upload: async (
    document: File,
    onUploadProgress?: (event: AxiosProgressEvent) => void,
  ) => {
    const form = new FormData();
    form.append("ninPhoto", document);
    return (
      await api.post("/nin/upload", form, {
        onUploadProgress,
      })
    ).data;
  },
};
