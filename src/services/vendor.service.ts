import { api } from "@/services/axios";
import type {
  VendorDashboardData,
  VendorDashboardStats,
  VendorInquiry,
  VendorPerformancePoint,
  VendorProfile,
  VendorPropertyStatusPoint,
} from "@/features/vendor/types";

type UnknownRecord = Record<string, unknown>;

const EMPTY_STATS: VendorDashboardStats = {
  totalListings: 0,
  activeListings: 0,
  pendingApproval: 0,
  leadsReceived: 0,
  acceptedInquiries: 0,
  pendingInquiries: 0,
  declinedInquiries: 0,
  totalSales: 0,
  rating: 0,
  reviewCount: 0,
  totalViews: 0,
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function unwrap(value: unknown): UnknownRecord {
  const root = asRecord(value);
  const data = asRecord(root.data);
  return Object.keys(data).length ? data : root;
}

function numberFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return 0;
}

function stringFrom(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function normalizeStats(statsResponse: unknown, inquiryStatsResponse: unknown) {
  const stats = unwrap(statsResponse);
  const inquiryStats = unwrap(inquiryStatsResponse);

  return {
    ...EMPTY_STATS,
    totalListings: numberFrom(stats, [
      "totalListings",
      "totalProperties",
      "listings",
    ]),
    activeListings: numberFrom(stats, [
      "activeListings",
      "activeProperties",
      "availableProperties",
    ]),
    pendingApproval: numberFrom(stats, [
      "pendingApproval",
      "pendingApprovals",
      "pendingProperties",
    ]),
    leadsReceived: numberFrom(stats, [
      "leadsReceived",
      "totalLeads",
      "totalInquiries",
      "inquiries",
    ]),
    acceptedInquiries: numberFrom(inquiryStats, [
      "accepted",
      "acceptedInquiries",
      "ACCEPTED",
    ]),
    pendingInquiries: numberFrom(inquiryStats, [
      "pending",
      "pendingInquiries",
      "PENDING",
    ]),
    declinedInquiries: numberFrom(inquiryStats, [
      "declined",
      "declinedInquiries",
      "DECLINED",
    ]),
    totalSales: numberFrom(stats, [
      "totalSales",
      "salesValue",
      "totalSalesValue",
      "revenue",
    ]),
    rating: numberFrom(stats, ["rating", "averageRating", "vendorRating"]),
    reviewCount: numberFrom(stats, ["reviewCount", "reviews", "totalReviews"]),
    totalViews: numberFrom(stats, [
      "totalViews",
      "propertyViews",
      "listingViews",
      "views",
      "viewCount",
    ]),
  } satisfies VendorDashboardStats;
}

function findArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const source = unwrap(value);
  for (const key of ["inquiries", "items", "results", "records"]) {
    if (Array.isArray(source[key])) return source[key];
  }
  return [];
}

function nestedArray(source: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
    const nested = asRecord(source[key]);
    for (const nestedKey of ["data", "items", "points", "series"]) {
      if (Array.isArray(nested[nestedKey]))
        return nested[nestedKey] as unknown[];
    }
  }
  return [];
}

function normalizePerformance(value: unknown): VendorPerformancePoint[] {
  const source = unwrap(value);
  return nestedArray(source, [
    "listingPerformance",
    "performance",
    "performanceData",
    "analytics",
    "trends",
  ]).map((item, index) => {
    const point = asRecord(item);
    const date = stringFrom(point, ["date", "createdAt", "period"]);
    return {
      label:
        stringFrom(point, ["label", "week", "month", "period"]) ??
        `Week ${index + 1}`,
      date,
      views: numberFrom(point, ["views", "viewCount", "totalViews"]),
      inquiries: numberFrom(point, ["inquiries", "leads", "inquiryCount"]),
    };
  });
}

function normalizePropertyStatus(value: unknown): VendorPropertyStatusPoint[] {
  const source = unwrap(value);
  return nestedArray(source, [
    "propertyStatus",
    "propertyStatuses",
    "statusTrends",
    "listingStatus",
    "listingTypes",
  ]).map((item, index) => {
    const point = asRecord(item);
    return {
      month:
        stringFrom(point, ["month", "label", "period"]) ?? `Month ${index + 1}`,
      shortlet: numberFrom(point, ["shortlet", "forShortlet", "FOR_SHORTLET"]),
      rent: numberFrom(point, ["rent", "forRent", "FOR_RENT"]),
      sale: numberFrom(point, ["sale", "forSale", "FOR_SALE"]),
      land: numberFrom(point, ["land", "forLand", "FOR_LAND"]),
    };
  });
}

function normalizeInquiries(value: unknown): VendorInquiry[] {
  return findArray(value).map((item, index) => {
    const inquiry = asRecord(item);
    const user = asRecord(inquiry.user ?? inquiry.buyer ?? inquiry.lead);
    const property = asRecord(inquiry.property);
    return {
      id: stringFrom(inquiry, ["id", "_id"]) ?? `inquiry-${index}`,
      name:
        stringFrom(inquiry, ["name", "fullName", "leadName"]) ??
        stringFrom(user, ["fullName", "name"]) ??
        "PropertyArk user",
      email:
        stringFrom(inquiry, ["email", "leadEmail"]) ??
        stringFrom(user, ["email"]),
      propertyName:
        stringFrom(inquiry, ["propertyName", "propertyTitle"]) ??
        stringFrom(property, ["name", "title"]) ??
        "Property inquiry",
      date:
        stringFrom(inquiry, [
          "createdAt",
          "requestedAt",
          "submittedAt",
          "date",
          "updatedAt",
        ]) ?? new Date(0).toISOString(),
      status: stringFrom(inquiry, ["status"]) ?? "PENDING",
    };
  });
}

function normalizeProfile(value: unknown): VendorProfile | null {
  const source = unwrap(value);
  const nestedUser = asRecord(source.user ?? source.profile);
  const profile = Object.keys(nestedUser).length ? nestedUser : source;
  const fullName = stringFrom(profile, ["fullName", "name", "username"]);
  const email = stringFrom(profile, ["email"]);
  if (!fullName && !email) return null;

  return {
    id: stringFrom(profile, ["id", "_id", "userId"]),
    fullName: fullName ?? "PropertyArk Vendor",
    email,
    phone: stringFrom(profile, ["phone"]),
    location: stringFrom(profile, ["location"]),
    avatarUrl: stringFrom(profile, ["avatar", "avatarUrl", "profilePicture"]),
  };
}

export const vendorService = {
  async getDashboard(): Promise<VendorDashboardData> {
    const [stats, inquiries, inquiryStats, profile] = await Promise.allSettled([
      api.get("/vendor/stats"),
      api.get("/inquiries/vendor", { params: { page: 1, limit: 100 } }),
      api.get("/inquiries/vendor/stats"),
      api.get("/users/profile"),
    ]);

    const responseData = (result: PromiseSettledResult<{ data: unknown }>) =>
      result.status === "fulfilled" ? result.value.data : undefined;

    const normalizedInquiries = normalizeInquiries(responseData(inquiries));
    const normalizedStats = normalizeStats(
      responseData(stats),
      responseData(inquiryStats),
    );

    return {
      stats: {
        ...normalizedStats,
        // The inquiry stats endpoint can lag behind the list endpoint. Never
        // show fewer received leads than the authenticated list already has.
        leadsReceived: Math.max(
          normalizedStats.leadsReceived,
          normalizedInquiries.length,
        ),
      },
      inquiries: normalizedInquiries,
      profile: normalizeProfile(responseData(profile)),
      performance: normalizePerformance(responseData(stats)),
      propertyStatus: normalizePropertyStatus(responseData(stats)),
    };
  },
};
