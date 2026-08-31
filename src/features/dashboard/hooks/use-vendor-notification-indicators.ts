"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccountKey } from "@/lib/account-identity";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth.store";

const BOOKING_PATTERN = /booking|short[ -]?let/i;
const INSPECTION_PATTERN = /inspection|inquiry|viewing/i;

export function useDashboardNotificationIndicators() {
  const accountKey = useAccountKey();
  const role = useAuthStore((state) => state.role);
  const query = useQuery({
    queryKey: [
      "dashboard",
      "notification-indicators",
      accountKey ?? "unresolved-session",
    ],
    queryFn: () =>
      notificationService.getAllMine().then((data) => data.notifications),
    enabled:
      Boolean(accountKey) &&
      (role === "vendor" || role === "buyer" || role === "user"),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const unread = (query.data ?? []).filter(
    (notification) => !notification.isRead,
  );
  const matches = (pattern: RegExp) =>
    unread.some((notification) =>
      pattern.test(
        [
          notification.type,
          notification.title,
          notification.message,
          notification.actionUrl,
        ]
          .filter(Boolean)
          .join(" "),
      ),
    );

  return {
    unreadCount: unread.length,
    hasUnread: unread.length > 0,
    hasUnreadBookings: matches(BOOKING_PATTERN),
    hasUnreadInspections: matches(INSPECTION_PATTERN),
  };
}

export const useVendorNotificationIndicators =
  useDashboardNotificationIndicators;
