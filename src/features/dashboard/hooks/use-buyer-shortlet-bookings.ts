"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccountKey } from "@/lib/account-identity";
import { shortletBookingService } from "@/services/shortlet-booking.service";

export function buyerShortletBookingsQueryKey(accountKey: string) {
  return ["buyer", "shortlet-bookings", accountKey] as const;
}

export function useBuyerShortletBookings() {
  const accountKey = useAccountKey();

  return useQuery({
    queryKey: buyerShortletBookingsQueryKey(accountKey ?? "unresolved-session"),
    queryFn: () => shortletBookingService.getBuyerBookings(accountKey!),
    enabled: Boolean(accountKey),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
