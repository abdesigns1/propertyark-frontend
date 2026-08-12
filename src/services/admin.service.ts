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
}

export interface AdminUserStats {
  total: number;
  verified: number;
  pending: number;
  flagged: number;
  active: number;
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
};
