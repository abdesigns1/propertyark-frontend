"use client";

import { useQuery } from "@tanstack/react-query";
import { vendorService } from "@/services/vendor.service";
import { useAccountKey } from "@/lib/account-identity";

export function vendorDashboardQueryKey(accountKey: string) {
  return ["vendor", "dashboard", accountKey] as const;
}

export function useVendorDashboard() {
  const accountKey = useAccountKey();

  return useQuery({
    queryKey: vendorDashboardQueryKey(accountKey ?? "unresolved-session"),
    queryFn: vendorService.getDashboard,
    enabled: Boolean(accountKey),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
