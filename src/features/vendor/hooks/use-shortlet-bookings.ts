"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccountKey } from "@/lib/account-identity";
import { shortletBookingService } from "@/services/shortlet-booking.service";

export function useShortletBookings() {
  const accountKey = useAccountKey();

  return useQuery({
    queryKey: [
      "vendor",
      "shortlet-bookings",
      accountKey ?? "unresolved-session",
    ],
    queryFn: shortletBookingService.getDashboard,
    enabled: Boolean(accountKey),
    staleTime: 30_000,
  });
}
