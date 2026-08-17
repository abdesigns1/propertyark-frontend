import { useQuery } from "@tanstack/react-query";
import { adminReportsService } from "@/services/admin-reports.service";

export function useAdminReportsAnalytics() {
  return useQuery({
    queryKey: ["admin", "reports", "analytics"],
    queryFn: adminReportsService.getAnalytics,
    staleTime: 60_000,
  });
}
