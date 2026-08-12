import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { propertyService } from "@/services/property.service";
import { inspectionService } from "@/services/inspection.service";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminService.getDashboard,
    staleTime: 60_000,
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

export function useAdminProperties(page: number, status: string) {
  return useQuery({
    queryKey: ["admin", "properties", page, status],
    queryFn: () =>
      adminService.getPropertyManagement({ page, limit: 10, status }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}
