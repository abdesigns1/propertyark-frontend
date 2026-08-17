import { api } from "@/services/axios";
import {
  adminService,
  type AdminManagedProperty,
  type AdminUser,
} from "@/services/admin.service";

export interface ReportGrowthPoint {
  label: string;
  users: number;
  vendors: number;
}

export type ReportGrowthPeriod = "daily" | "weekly" | "monthly" | "yearly";
export type ReportFilterPeriod =
  "default" | "today" | "week" | "month" | "year" | "custom";

export interface ReportDateFilter {
  period: ReportFilterPeriod;
  startDate?: string;
  endDate?: string;
}

export interface ReportCategory {
  label: string;
  value: number;
}

export interface ReportLocation {
  location: string;
  listings: number;
  views: number;
  successTransactions: number;
  performance: number;
}

export interface AdminReportsAnalytics {
  activeUsers: number;
  activeUsersChange: number;
  totalListings: number;
  listingsChange: number;
  userGrowth: Record<ReportGrowthPeriod, ReportGrowthPoint[]>;
  categories: ReportCategory[];
  locations: ReportLocation[];
  sourceUsers: AdminUser[];
  sourceProperties: AdminManagedProperty[];
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function nestedNumber(value: unknown, keys: string[]) {
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

function countUsers(users: AdminUser[], predicate: (date: Date) => boolean) {
  const matches = users.filter((user) => {
    const createdAt = new Date(user.createdAt);
    return !Number.isNaN(createdAt.getTime()) && predicate(createdAt);
  });

  return {
    users: matches.filter((user) => user.role.toUpperCase() !== "VENDOR")
      .length,
    vendors: matches.filter((user) => user.role.toUpperCase() === "VENDOR")
      .length,
  };
}

function buildUserGrowth(
  users: AdminUser[],
): Record<ReportGrowthPeriod, ReportGrowthPoint[]> {
  const today = new Date();
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    return {
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(day),
      ...countUsers(
        users,
        (date) => date.toDateString() === day.toDateString(),
      ),
    };
  });
  const weekly = Array.from({ length: 7 }, (_, index) => {
    const end = new Date(today);
    end.setDate(today.getDate() - (6 - index) * 7 + 1);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    return {
      label: `W${index + 1}`,
      ...countUsers(users, (date) => date >= start && date < end),
    };
  });
  const monthly = Array.from({ length: 7 }, (_, index) => {
    const month = new Date(
      today.getFullYear(),
      today.getMonth() - (6 - index),
      1,
    );
    return {
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(month),
      ...countUsers(
        users,
        (date) =>
          date.getFullYear() === month.getFullYear() &&
          date.getMonth() === month.getMonth(),
      ),
    };
  });
  const yearly = Array.from({ length: 5 }, (_, index) => {
    const year = today.getFullYear() - (4 - index);
    return {
      label: String(year),
      ...countUsers(users, (date) => date.getFullYear() === year),
    };
  });

  return { daily, weekly, monthly, yearly };
}

function buildCategories(properties: AdminManagedProperty[]): ReportCategory[] {
  const labels: Record<string, string> = {
    FOR_RENT: "Rent",
    FOR_LAND: "Land",
    FOR_SHORTLET: "Shortlet",
    FOR_SALE: "For Sale",
  };
  const counts = new Map<string, number>();

  properties.forEach((property) => {
    const label = labels[property.listingType] ?? property.listingType;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  const total = properties.length || 1;
  return Object.values(labels).map((label) => ({
    label,
    value: Math.round(((counts.get(label) ?? 0) / total) * 100),
  }));
}

function buildLocations(properties: AdminManagedProperty[]): ReportLocation[] {
  const groups = new Map<
    string,
    { listings: number; views: number; successTransactions: number }
  >();

  properties.forEach((property) => {
    const location = [property.city, property.state].filter(Boolean).join(", ");
    const source = asRecord(property);
    const current = groups.get(location) ?? {
      listings: 0,
      views: 0,
      successTransactions: 0,
    };
    current.listings += 1;
    current.views += Number(source.viewCount ?? source.views) || 0;
    // Finance endpoint pending: deterministic placeholder based on listing volume.
    current.successTransactions = Math.round(current.listings * 0.14);
    groups.set(location || "Location not provided", current);
  });

  const rows = [...groups.entries()]
    .map(([location, values]) => ({ location, ...values }))
    .sort((first, second) => second.listings - first.listings);
  const highest = Math.max(...rows.map((row) => row.listings), 1);

  return rows.map((row) => ({
    ...row,
    performance: Math.round((row.listings / highest) * 100),
  }));
}

export const adminReportsService = {
  getAnalytics: async (): Promise<AdminReportsAnalytics> => {
    const [overviewResult, usersResult, propertiesResult] =
      await Promise.allSettled([
        api.get<unknown>("/admin/platform-overview"),
        adminService.getUsers(1, 1000),
        adminService.getPropertyManagement({ page: 1, limit: 1000 }),
      ]);
    const overview =
      overviewResult.status === "fulfilled" ? overviewResult.value.data : {};
    const users =
      usersResult.status === "fulfilled" ? usersResult.value.users : [];
    const propertyData =
      propertiesResult.status === "fulfilled" ? propertiesResult.value : null;
    const properties = propertyData?.properties ?? [];
    const verifiedUsers = users.filter(
      (user) => user.isVerified && !user.isSuspended,
    ).length;

    return {
      activeUsers:
        nestedNumber(overview, ["activeUsers", "totalActiveUsers"]) ??
        verifiedUsers,
      activeUsersChange:
        nestedNumber(overview, ["activeUsersChange", "userGrowthRate"]) ?? 0,
      totalListings:
        nestedNumber(overview, ["totalListings", "totalProperties"]) ??
        propertyData?.stats.totalListings ??
        properties.length,
      listingsChange:
        nestedNumber(overview, ["listingsChange", "listingGrowthRate"]) ?? 0,
      userGrowth: buildUserGrowth(users),
      categories: buildCategories(properties),
      locations: buildLocations(properties),
      sourceUsers: users,
      sourceProperties: properties,
    };
  },
};

export function filterReportsAnalytics(
  analytics: AdminReportsAnalytics,
  filter: ReportDateFilter,
): AdminReportsAnalytics {
  const range = reportDateRange(filter);
  if (!range) return analytics;
  const users = analytics.sourceUsers.filter((user) =>
    isWithinRange(user.createdAt, range),
  );
  const properties = analytics.sourceProperties.filter((property) =>
    isWithinRange(property.createdAt, range),
  );
  const duration = range.end.getTime() - range.start.getTime();
  const previousRange = {
    start: new Date(range.start.getTime() - duration - 1),
    end: new Date(range.start.getTime() - 1),
  };
  const previousUsers = analytics.sourceUsers.filter(
    (user) => !user.isSuspended && isWithinRange(user.createdAt, previousRange),
  ).length;
  const previousProperties = analytics.sourceProperties.filter((property) =>
    isWithinRange(property.createdAt, previousRange),
  ).length;
  const activeUsers = users.filter((user) => !user.isSuspended).length;

  return {
    ...analytics,
    activeUsers,
    activeUsersChange: percentageChange(activeUsers, previousUsers),
    totalListings: properties.length,
    listingsChange: percentageChange(properties.length, previousProperties),
    userGrowth: buildUserGrowth(users),
    categories: buildCategories(properties),
    locations: buildLocations(properties),
    sourceUsers: users,
    sourceProperties: properties,
  };
}

export function reportDateRange(filter: ReportDateFilter) {
  if (filter.period === "default") return null;
  const end = filter.endDate
    ? new Date(`${filter.endDate}T23:59:59.999`)
    : new Date();
  let start: Date;

  if (filter.period === "custom") {
    if (!filter.startDate) return null;
    start = new Date(`${filter.startDate}T00:00:00`);
  } else {
    start = new Date(end);
    if (filter.period === "today") start.setHours(0, 0, 0, 0);
    if (filter.period === "week") start.setDate(end.getDate() - 6);
    if (filter.period === "month") start.setMonth(end.getMonth() - 1);
    if (filter.period === "year") start.setFullYear(end.getFullYear() - 1);
  }

  return { start, end };
}

function isWithinRange(value: string, range: { start: Date; end: Date }) {
  const date = new Date(value);
  return (
    !Number.isNaN(date.getTime()) && date >= range.start && date <= range.end
  );
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1_000) / 10;
}
