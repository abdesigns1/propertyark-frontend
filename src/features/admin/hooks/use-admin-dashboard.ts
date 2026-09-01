import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { propertyService } from "@/services/property.service";
import { inspectionService } from "@/services/inspection.service";
import { shortletBookingService } from "@/services/shortlet-booking.service";
import {
  activityService,
  type AdminActivity,
} from "@/services/activity.service";
import type { AdminManagedProperty, AdminUser } from "@/services/admin.service";

export interface AdminGrowthHistory {
  users: AdminUser[];
  properties: AdminManagedProperty[];
  activities: AdminActivity[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminService.getDashboard,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useAdminGrowthHistory() {
  return useQuery<AdminGrowthHistory>({
    queryKey: ["admin", "dashboard", "growth-history"],
    queryFn: async () => {
      const pageSize = 100;
      const [firstUsers, firstProperties, firstActivities] = await Promise.all([
        adminService.getUsers(1, pageSize),
        adminService.getPropertyManagement({
          page: 1,
          limit: pageSize,
          status: "ALL",
        }),
        activityService.getAll({ page: 1, limit: pageSize }),
      ]);

      const [userPages, propertyPages, activityPages] = await Promise.all([
        Promise.all(
          Array.from(
            { length: Math.max(0, firstUsers.pagination.pages - 1) },
            (_, index) => adminService.getUsers(index + 2, pageSize),
          ),
        ),
        Promise.all(
          Array.from(
            { length: Math.max(0, firstProperties.pagination.pages - 1) },
            (_, index) =>
              adminService.getPropertyManagement({
                page: index + 2,
                limit: pageSize,
                status: "ALL",
              }),
          ),
        ),
        Promise.all(
          Array.from(
            { length: Math.max(0, firstActivities.pagination.pages - 1) },
            (_, index) =>
              activityService.getAll({ page: index + 2, limit: pageSize }),
          ),
        ),
      ]);

      return {
        users: [firstUsers, ...userPages].flatMap((page) => page.users),
        properties: [firstProperties, ...propertyPages].flatMap(
          (page) => page.properties,
        ),
        activities: [firstActivities, ...activityPages].flatMap(
          (page) => page.activities,
        ),
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useAdminUsers(page: number, limit = 4) {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: () => adminService.getUsers(page, limit),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminService.getUserById(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: adminService.getUserStats,
    staleTime: 60_000,
  });
}

export function useAdminKycRequests(
  page: number,
  status = "ALL",
  role = "ALL",
) {
  return useQuery({
    queryKey: ["admin", "kyc", "requests", page, status, role],
    queryFn: () => adminService.getKycRequests(page, 20, { status, role }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminKycStats() {
  return useQuery({
    queryKey: ["admin", "kyc", "stats"],
    queryFn: adminService.getKycStats,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminKycRequest(requestId: string) {
  return useQuery({
    queryKey: ["admin", "kyc", "request", requestId],
    queryFn: () => adminService.getKycRequestById(requestId),
    enabled: Boolean(requestId),
    staleTime: 30_000,
  });
}

export function useAdminVendorProperties(vendorId: string, enabled = true) {
  return useQuery({
    queryKey: ["admin", "vendor", vendorId, "properties"],
    queryFn: async () => {
      const response = await propertyService.getAvailable({
        page: 1,
        limit: 1000,
      });
      return response.properties.filter(
        (property) => property.vendorId === vendorId,
      );
    },
    enabled: enabled && Boolean(vendorId),
    staleTime: 30_000,
  });
}

export function useAdminUserInspections({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return useQuery({
    queryKey: ["admin", "user", userId, "inspections"],
    queryFn: () => inspectionService.getInspectionsForUser({ userId, email }),
    enabled: Boolean(userId && email),
    staleTime: 30_000,
  });
}

export function useAdminVendorInspections({
  vendorId,
  email,
  propertyIds,
}: {
  vendorId: string;
  email: string;
  propertyIds: string[];
}) {
  return useQuery({
    queryKey: ["admin", "vendor", vendorId, "inspections", propertyIds],
    queryFn: () =>
      inspectionService.getInspectionsForVendor({
        vendorId,
        email,
        propertyIds,
      }),
    enabled: Boolean(vendorId && email),
    staleTime: 30_000,
  });
}

export function useAdminProperties(page: number, status: string, limit = 10) {
  return useQuery({
    queryKey: ["admin", "properties", page, status, limit],
    queryFn: () => adminService.getPropertyManagement({ page, limit, status }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

export function useAdminProperty(propertyId: string) {
  return useQuery({
    queryKey: ["admin", "property", propertyId],
    queryFn: async () => {
      const [property, assets] = await Promise.all([
        propertyService.getById(propertyId),
        propertyService.getAssets(propertyId),
      ]);
      return {
        ...property,
        media: assets.media.length ? assets.media : property.media,
        documents: assets.documents.length
          ? assets.documents
          : property.documents,
      };
    },
    enabled: Boolean(propertyId),
    staleTime: 30_000,
  });
}

export function useAdminInspections(page: number, limit = 10) {
  return useQuery({
    queryKey: ["admin", "inspections", page, limit],
    queryFn: () => inspectionService.getAdminInspections({ page, limit }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useAdminInspection(inspectionId: string) {
  return useQuery({
    queryKey: ["admin", "inspection", inspectionId],
    queryFn: () => inspectionService.getAdminInspection(inspectionId),
    enabled: Boolean(inspectionId),
    staleTime: 30_000,
  });
}

export function useAdminShortletBookings(page: number, limit = 10) {
  return useQuery({
    queryKey: ["admin", "shortlet-bookings", page, limit],
    queryFn: () => shortletBookingService.getAdminBookings({ page, limit }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useAdminShortletBooking(bookingId: string) {
  return useQuery({
    queryKey: ["admin", "shortlet-booking", bookingId],
    queryFn: () => shortletBookingService.getAdminBooking(bookingId),
    enabled: Boolean(bookingId),
    staleTime: 30_000,
  });
}
