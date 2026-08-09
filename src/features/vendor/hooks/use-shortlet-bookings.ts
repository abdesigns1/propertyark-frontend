"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccountKey } from "@/lib/account-identity";
import { getApiErrorMessage } from "@/services/api-error";
import { shortletBookingService } from "@/services/shortlet-booking.service";

export function shortletBookingsQueryKey(accountKey: string) {
  return ["vendor", "shortlet-bookings", accountKey] as const;
}

export function useShortletBookings() {
  const accountKey = useAccountKey();

  return useQuery({
    queryKey: shortletBookingsQueryKey(
      accountKey ?? "unresolved-session",
    ),
    queryFn: shortletBookingService.getDashboard,
    enabled: Boolean(accountKey),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useUpdateShortletBooking() {
  const accountKey = useAccountKey();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shortletBookingService.updateStatus,
    onSuccess: async (_data, variables) => {
      const message = {
        approve: "Booking approved successfully.",
        "check-in": "Guest checked in successfully.",
        cancel: "Booking cancelled successfully.",
      }[variables.action];
      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: shortletBookingsQueryKey(
          accountKey ?? "unresolved-session",
        ),
      });
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The booking could not be updated."),
      ),
  });
}
