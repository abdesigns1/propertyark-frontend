import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminService.getDashboard,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminUsers(page: number) {
  return useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => adminService.getUsers(page, 4),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}
