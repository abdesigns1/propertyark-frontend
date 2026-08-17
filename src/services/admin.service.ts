import { api } from "@/services/axios";

export interface AdminProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  listingStatus: "ACTIVE" | "PENDING" | "REJECTED" | string;
  vendor?: { fullName?: string };
  priceDisplay?: { amount?: number; display?: string; currency?: string };
}

export interface DashboardGrowthPoint {
  date: string;
  dayShort: string;
  newUsers?: number;
  totalUsers?: number;
  newListings?: number;
  totalListings?: number;
  revenue?: number;
}

export interface AdminDashboardData {
  dashboardStats: {
    totalUsers: number;
    activeVendors: number;
    totalProperties: number;
    pendingReviews: number;
  };
  growthRevenue: {
    userGrowth: DashboardGrowthPoint[];
    listingGrowth: DashboardGrowthPoint[];
  };
  properties: AdminProperty[];
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  ninVerificationStatus?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string | null;
  phone?: string | null;
  location?: string | null;
  avatar?: string | null;
  status?: string | null;
  isSuspended?: boolean;
  isFlagged?: boolean;
  ninPhoto?: string | null;
  ninPhotoUrl?: string | null;
  ninRejectionReason?: string | null;
}

export interface AdminUserStats {
  total: number;
  verified: number;
  pending: number;
  flagged: number;
  active: number;
}

export interface AdminKycRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  submittedAt: string;
  documentUrl: string | null;
  documentName: string;
  rejectionReason?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface AdminKycStats {
  pending: number;
  rejected: number;
  verified: number;
  verifiedToday: number;
  averageProcessingHours: number;
}

export interface AdminKycFilters {
  status?: string;
  role?: string;
}

export interface AdminManagedProperty {
  id: string;
  name: string;
  type: string;
  listingType: string;
  status: string;
  listingStatus: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
  rentAmount: number | null;
  salePrice: number | null;
  landFee: number | null;
  shortletAmount: number | null;
  media?: Array<{ id: string; type: string; url: string; isPrimary: boolean }>;
  vendor?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export interface AdminPropertyManagementData {
  properties: AdminManagedProperty[];
  stats: {
    totalListings: number;
    pendingReviews: number;
    activeListings: number;
    rejectedListings: number;
  };
  pagination: { page: number; limit: number; total: number; pages: number };
}

interface ApiEnvelope<T> {
  data: T;
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(source: UnknownRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

function number(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = Number(source[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function nestedNumber(value: unknown, keys: string[]): number | undefined {
  const expectedKeys = new Set(keys.map((key) => key.toLowerCase()));
  const queue: unknown[] = [value];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;

    for (const [key, candidate] of Object.entries(record(current))) {
      if (expectedKeys.has(key.toLowerCase())) {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
      }

      if (candidate && typeof candidate === "object") queue.push(candidate);
    }
  }

  return undefined;
}

const KYC_DOCUMENT_KEYS = [
  "ninPhoto",
  "ninPhotoUrl",
  "ninDocument",
  "ninDocumentUrl",
  "documentUrl",
  "fileUrl",
  "secureUrl",
  "imageUrl",
  "url",
] as const;

function kycDocumentUrl(...sources: unknown[]): string | null {
  for (const value of sources) {
    if (typeof value === "string" && value.trim()) {
      return normalizeKycDocumentUrl(value);
    }

    const source = record(value);
    for (const key of KYC_DOCUMENT_KEYS) {
      const candidate = source[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return normalizeKycDocumentUrl(candidate);
      }

      const nested = record(candidate);
      const nestedUrl = text(nested, [
        "url",
        "fileUrl",
        "secureUrl",
        "location",
        "path",
      ]);
      if (nestedUrl) return normalizeKycDocumentUrl(nestedUrl);
    }
  }

  return null;
}

function normalizeKycDocumentUrl(url: string) {
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.hostname === "propertyark-backend.onrender.com" &&
      parsed.pathname.startsWith("/uploads/")
    ) {
      return `/api/property-media/${parsed.pathname.slice("/uploads/".length)}`;
    }
  } catch {
    // The API can also return an upload path without its origin.
  }

  const uploadPath = trimmed.replace(/^\/?uploads\//, "");
  if (uploadPath !== trimmed) return `/api/property-media/${uploadPath}`;

  return trimmed;
}

function normalizeKycRequest(value: unknown): AdminKycRequest {
  const source = record(value);
  const user = record(source.user ?? source.vendor ?? source.account);
  const id = text(source, ["id", "_id", "verificationId"]);
  const userId = text(
    source,
    ["userId", "vendorId"],
    text(user, ["id", "_id"], id),
  );
  const documentUrl = kycDocumentUrl(
    source,
    user,
    source.document,
    source.nin,
    source.kyc,
    source.verification,
  );
  return {
    id: id || userId,
    userId,
    fullName: text(
      source,
      ["fullName", "name"],
      text(user, ["fullName", "name"], "Unnamed account"),
    ),
    email: text(source, ["email"], text(user, ["email"])),
    role: text(source, ["role", "userType"], text(user, ["role"], "VENDOR")),
    status: text(
      source,
      ["status", "ninVerificationStatus"],
      "PENDING",
    ).toUpperCase(),
    submittedAt: text(
      source,
      ["submittedAt", "createdAt", "updatedAt"],
      new Date().toISOString(),
    ),
    documentUrl,
    documentName: text(
      source,
      ["documentName", "fileName"],
      `NIN-${userId || id}`,
    ),
    rejectionReason: text(source, ["rejectionReason"]) || null,
    phone: text(source, ["phone"], text(user, ["phone"])) || null,
    location:
      text(
        source,
        ["location", "address"],
        text(user, ["location", "address"]),
      ) || null,
  };
}

function unwrapKycRequests(value: unknown) {
  const root = record(value);
  const data = root.data ?? value;
  const payload = record(data);
  const rows = (
    Array.isArray(data)
      ? data
      : ([
          payload.verifications,
          payload.pendingVerifications,
          payload.pending,
          payload.requests,
          payload.items,
          payload.users,
          payload.vendors,
        ].find(Array.isArray) ?? [])
  ) as unknown[];
  const pagination = record(payload.pagination);
  const requests = rows.map(normalizeKycRequest);
  return {
    requests,
    pagination: {
      page: number(pagination, ["page"]) || 1,
      limit: number(pagination, ["limit"]) || 20,
      total: number(pagination, ["total"]) || requests.length,
      pages: number(pagination, ["pages"]) || 1,
    },
  };
}

function userToKycRequest(user: AdminUser): AdminKycRequest | null {
  const status = user.ninVerificationStatus?.toUpperCase();
  if (!status) return null;

  return {
    id: user.id,
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status,
    submittedAt: user.updatedAt ?? user.createdAt,
    documentUrl: kycDocumentUrl(
      user,
      record(user).document,
      record(user).nin,
      record(user).kyc,
      record(user).verification,
    ),
    documentName: `NIN-${user.fullName.replaceAll(" ", "-")}`,
    rejectionReason: user.ninRejectionReason ?? null,
    phone: user.phone,
    location: user.location,
  };
}

function matchesKycFilters(request: AdminKycRequest, filters: AdminKycFilters) {
  const status = filters.status?.toUpperCase();
  const role = filters.role?.toUpperCase();

  return (
    (!status || status === "ALL" || request.status === status) &&
    (!role ||
      role === "ALL" ||
      request.role.toUpperCase() === role ||
      (role === "USER" && request.role.toUpperCase() === "BUYER"))
  );
}

export const adminService = {
  getDashboard: () =>
    api
      .get<ApiEnvelope<AdminDashboardData>>("/admin/dashboard")
      .then(({ data }) => data.data),

  getUsers: (page = 1, limit = 4) =>
    api
      .get<
        ApiEnvelope<{
          users: AdminUser[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>
      >("/users/", { params: { page, limit } })
      .then(({ data }) => data.data),

  getUserById: (userId: string) =>
    api
      .get<ApiEnvelope<{ users: AdminUser[] }>>("/users/", {
        params: { page: 1, limit: 100 },
      })
      .then(
        ({ data }) =>
          data.data.users.find((user) => user.id === userId) ?? null,
      ),

  deleteUser: (userId: string) =>
    api.delete(`/users/${encodeURIComponent(userId)}`),

  getUserStats: () =>
    api
      .get<
        ApiEnvelope<{
          users: AdminUser[];
          pagination: { total: number };
        }>
      >("/users/", { params: { page: 1, limit: 100 } })
      .then(({ data }) => {
        const { users, pagination } = data.data;
        const isFlagged = (user: AdminUser) =>
          user.isFlagged === true ||
          user.isSuspended === true ||
          ["FLAGGED", "SUSPENDED"].includes(user.status?.toUpperCase() ?? "");

        return {
          total: pagination.total,
          verified: users.filter((user) => user.isVerified).length,
          pending: users.filter((user) => !user.isVerified).length,
          flagged: users.filter(isFlagged).length,
          active: users.filter((user) => user.isVerified && !isFlagged(user))
            .length,
        } satisfies AdminUserStats;
      }),

  getKycRequests: async (
    page = 1,
    limit = 20,
    filters: AdminKycFilters = {},
  ) => {
    const [{ data: pendingData }, { data: usersData }] = await Promise.all([
      api.get<unknown>("/nin/pending", { params: { page: 1, limit: 1000 } }),
      api.get<ApiEnvelope<{ users: AdminUser[] }>>("/users/", {
        params: { page: 1, limit: 1000 },
      }),
    ]);
    const pending = unwrapKycRequests(pendingData).requests;
    const historical = usersData.data.users
      .map(userToKycRequest)
      .filter((item): item is AdminKycRequest => Boolean(item));
    const records = new Map(historical.map((item) => [item.userId, item]));

    // The NIN queue is authoritative for pending documents and submission data.
    pending.forEach((item) => records.set(item.userId, item));
    const requests = [...records.values()]
      .filter((request) => matchesKycFilters(request, filters))
      .sort(
        (first, second) =>
          new Date(second.submittedAt).getTime() -
          new Date(first.submittedAt).getTime(),
      );
    const total = requests.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;

    return {
      requests: requests.slice(start, start + limit),
      pagination: { page, limit, total, pages },
    };
  },

  getKycRequestById: async (requestId: string) => {
    const data = await adminService.getKycRequests(1, 1000);
    return (
      data.requests.find(
        (request) => request.id === requestId || request.userId === requestId,
      ) ?? null
    );
  },

  getKycStats: async () => {
    const [statsResult, requestsResult] = await Promise.allSettled([
      api.get<unknown>("/admin/nin-stats"),
      adminService.getKycRequests(1, 1000),
    ]);
    const response =
      statsResult.status === "fulfilled" ? statsResult.value.data : {};
    const requests =
      requestsResult.status === "fulfilled"
        ? requestsResult.value.requests
        : [];
    const today = new Date();
    const isToday = (date: string) => {
      const value = new Date(date);
      return (
        value.getFullYear() === today.getFullYear() &&
        value.getMonth() === today.getMonth() &&
        value.getDate() === today.getDate()
      );
    };
    const derivedPending = requests.filter(
      (request) => request.status === "PENDING",
    ).length;
    const derivedRejected = requests.filter(
      (request) => request.status === "REJECTED",
    ).length;
    const derivedVerified = requests.filter(
      (request) => request.status === "VERIFIED",
    ).length;
    const derivedVerifiedToday = requests.filter(
      (request) =>
        request.status === "VERIFIED" && isToday(request.submittedAt),
    ).length;
    const endpointPending = nestedNumber(response, [
      "pending",
      "pendingVerification",
      "pendingVerifications",
      "pendingCount",
      "totalPending",
    ]);
    const endpointRejected = nestedNumber(response, [
      "rejected",
      "flagged",
      "rejectedCount",
      "flaggedRejected",
      "totalRejected",
    ]);
    const endpointVerifiedToday = nestedNumber(response, [
      "verifiedToday",
      "approvedToday",
      "todayVerified",
      "verifiedTodayCount",
    ]);
    const endpointVerified = nestedNumber(response, [
      "verified",
      "verifiedCount",
      "totalVerified",
      "approved",
      "approvedCount",
      "totalApproved",
    ]);

    return {
      pending: Math.max(endpointPending ?? 0, derivedPending),
      rejected: Math.max(endpointRejected ?? 0, derivedRejected),
      verified: Math.max(endpointVerified ?? 0, derivedVerified),
      verifiedToday: Math.max(endpointVerifiedToday ?? 0, derivedVerifiedToday),
      averageProcessingHours:
        nestedNumber(response, [
          "averageProcessingHours",
          "avgProcessingHours",
          "avgProcessingTime",
          "averageProcessingTime",
          "processingTimeHours",
        ]) ?? 0,
    } satisfies AdminKycStats;
  },

  reviewKyc: (
    userId: string,
    status: "VERIFIED" | "REJECTED",
    rejectionReason?: string,
  ) => api.patch(`/nin/${userId}/verify`, { status, rejectionReason }),

  getPropertyManagement: ({
    page = 1,
    limit = 10,
    status,
  }: {
    page?: number;
    limit?: number;
    status?: string;
  }) =>
    api
      .get<ApiEnvelope<AdminPropertyManagementData>>("/admin/property-stats", {
        params: { page, limit, status: status === "ALL" ? undefined : status },
      })
      .then(({ data }) => data.data),

  approveProperty: (propertyId: string) =>
    api.patch(`/properties/${propertyId}/review`, { status: "accept" }),

  rejectProperty: (propertyId: string, rejectionReason: string) =>
    api.patch(`/properties/${propertyId}/review`, {
      status: "reject",
      rejectionReason,
    }),
};
