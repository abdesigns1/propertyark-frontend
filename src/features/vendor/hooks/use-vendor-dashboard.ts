"use client";

import { useQuery } from "@tanstack/react-query";
import { vendorService } from "@/services/vendor.service";

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["vendor", "dashboard"],
    queryFn: vendorService.getDashboard,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
