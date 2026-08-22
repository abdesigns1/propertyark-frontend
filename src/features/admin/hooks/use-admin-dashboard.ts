import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { propertyService } from "@/services/property.service";
import { inspectionService } from "@/services/inspection.service";
import { shortletBookingService } from "@/services/shortlet-booking.service";

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
  });
}

export function useAdminKycStats() {
  return useQuery({
    queryKey: ["admin", "kyc", "stats"],
    queryFn: adminService.getKycStats,
    staleTime: 30_000,
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

export function useAdminProperties(page: number, status: string) {
  return useQuery({
    queryKey: ["admin", "properties", page, status],
    queryFn: () =>
      adminService.getPropertyManagement({ page, limit: 10, status }),
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
