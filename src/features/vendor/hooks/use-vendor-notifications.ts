"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountKey } from "@/lib/account-identity";
import { notificationService } from "@/services/notification.service";

export function vendorNotificationsQueryKey(accountKey: string) {
  return ["vendor", "notifications", accountKey] as const;
}

export function useVendorNotifications() {
  const accountKey = useAccountKey();
  return useQuery({
    queryKey: [
      ...vendorNotificationsQueryKey(accountKey ?? "unresolved-session"),
      "list",
      "all",
    ],
    queryFn: () => notificationService.getAllMine(),
    enabled: Boolean(accountKey),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useMarkVendorNotificationRead() {
  const accountKey = useAccountKey();
  const client = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: vendorNotificationsQueryKey(
            accountKey ?? "unresolved-session",
          ),
        }),
        client.invalidateQueries({
          queryKey: ["dashboard", "notification-indicators"],
        }),
      ]);
    },
  });
}

export function useMarkAllVendorNotificationsRead() {
  const accountKey = useAccountKey();
  const client = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: vendorNotificationsQueryKey(
            accountKey ?? "unresolved-session",
          ),
        }),
        client.invalidateQueries({
          queryKey: ["dashboard", "notification-indicators"],
        }),
      ]);
    },
  });
}
