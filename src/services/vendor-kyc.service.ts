import type { AxiosProgressEvent } from "axios";
import { api } from "@/services/axios";

export type VendorKycStatus =
  "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface VendorKycState {
  status: VendorKycStatus;
  rejectionReason: string | null;
  hasDocument: boolean;
  /**
   * The status returned by the profile endpoint before document evidence is
   * considered. Some profile responses intentionally omit the private KYC
   * document URL, so consumers can use this to preserve a known submission.
   */
  reportedStatus: VendorKycStatus | null;
}

type UnknownRecord = Record<string, unknown>;
const KYC_SUBMISSION_STORAGE_PREFIX = "propertyark-vendor-kyc-submitted:";

function submissionStorageKey(accountKey: string) {
  return `${KYC_SUBMISSION_STORAGE_PREFIX}${accountKey}`;
}

export function rememberVendorKycSubmission(accountKey: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(submissionStorageKey(accountKey), "1");
  } catch {
    // The in-memory query state still preserves the submission when storage is
    // unavailable (for example, in a privacy-restricted browser context).
  }
}

export function hasRememberedVendorKycSubmission(accountKey: string) {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(submissionStorageKey(accountKey)) === "1"
    );
  } catch {
    return false;
  }
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function nestedText(value: unknown, keys: string[]) {
  const expectedKeys = new Set(keys.map((key) => key.toLowerCase()));
  const queue: unknown[] = [value];
  const visited = new Set<object>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    for (const [key, candidate] of Object.entries(record(current))) {
      if (
        expectedKeys.has(key.toLowerCase()) &&
        typeof candidate === "string" &&
        candidate.trim()
      ) {
        return candidate.trim();
      }

      if (candidate && typeof candidate === "object") queue.push(candidate);
    }
  }

  return null;
}

function normalizeKycState(value: unknown): VendorKycState {
  const documentUrl = nestedText(value, [
    "ninPhoto",
    "ninPhotoUrl",
    "ninImage",
    "ninImageUrl",
    "ninDocument",
    "ninDocumentUrl",
    "identityDocument",
    "identityDocumentUrl",
    "documentUrl",
  ]);
  const rawStatus = nestedText(value, [
    "ninVerificationStatus",
    "ninStatus",
    "identityVerificationStatus",
    "verificationStatus",
  ])?.toUpperCase();
  const reportedStatus = [
    "NOT_SUBMITTED",
    "PENDING",
    "VERIFIED",
    "REJECTED",
  ].includes(rawStatus ?? "")
    ? (rawStatus as VendorKycStatus)
    : null;
  const status = ["VERIFIED", "REJECTED"].includes(rawStatus ?? "")
    ? (rawStatus as VendorKycStatus)
    : rawStatus === "PENDING" && documentUrl
      ? "PENDING"
      : "NOT_SUBMITTED";

  return {
    status,
    rejectionReason: nestedText(value, [
      "ninRejectionReason",
      "rejectionReason",
    ]),
    hasDocument: Boolean(documentUrl),
    reportedStatus,
  };
}

function hasKycUploadActivity(value: unknown) {
  const queue: unknown[] = [value];
  const visited = new Set<object>();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    const source = record(current);
    const action = [source.action, source.activityType].find(
      (candidate) => typeof candidate === "string",
    );
    if (typeof action === "string" && action.toUpperCase() === "UPLOAD_NIN") {
      return true;
    }

    queue.push(...Object.values(source));
  }

  return false;
}

export const vendorKycService = {
  getStatus: async (): Promise<VendorKycState> => {
    const profileResponse = (await api.get("/users/profile")).data;
    const state = normalizeKycState(profileResponse);

    if (
      state.reportedStatus !== "PENDING" ||
      state.hasDocument ||
      state.status === "VERIFIED" ||
      state.status === "REJECTED"
    ) {
      return state;
    }

    // Some production profile responses omit private KYC media. The vendor's
    // own activity log is durable server-side evidence that an upload exists,
    // and avoids mistaking every new vendor's default PENDING value for a real
    // submission.
    const userId = nestedText(profileResponse, ["id", "userId"]);
    if (!userId) return state;

    try {
      const activityResponse = (
        await api.get(`/activity/user/${encodeURIComponent(userId)}`, {
          params: { action: "UPLOAD_NIN", page: 1, limit: 1 },
        })
      ).data;

      if (hasKycUploadActivity(activityResponse)) {
        return { ...state, status: "PENDING", hasDocument: true };
      }
    } catch {
      // Keep the profile-derived state when the optional evidence lookup is
      // unavailable; locally remembered submissions are handled by the hook.
    }

    return state;
  },

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
