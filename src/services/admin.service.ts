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
};
