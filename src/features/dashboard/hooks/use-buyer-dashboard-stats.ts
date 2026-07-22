"use client";

import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "@/features/properties/hooks/use-favorites";
import { useAccountKey } from "@/lib/account-identity";
import { buyerDashboardService } from "@/services/buyer-dashboard.service";

export function useBuyerDashboardStats() {
  const ownerKey = useAccountKey();
  const favorites = useFavorites();
  const inquiries = useQuery({
    queryKey: [
      "buyer-dashboard",
      "active-inquiries",
      ownerKey ?? "unresolved-session",
    ],
    queryFn: buyerDashboardService.getActiveInquiryCount,
    enabled: Boolean(ownerKey),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    savedProperties: favorites.data?.propertyIds.length ?? 0,
    activeInquiries: inquiries.data ?? 0,
    isLoading: favorites.isLoading || inquiries.isLoading,
  };
}
