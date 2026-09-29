"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminKycStats } from "@/features/admin/hooks/use-admin-dashboard";
import { useAdminNotifications } from "@/features/admin/hooks/use-admin-notifications";
import { adminService } from "@/services/admin.service";
import { chatService } from "@/services/chat.service";

const INDICATOR_REFRESH_INTERVAL = 20_000;

export function useAdminNotificationIndicators() {
  const notifications = useAdminNotifications();
  const kyc = useAdminKycStats();
  const properties = useQuery({
    queryKey: ["admin", "navigation-indicators", "pending-properties"],
    queryFn: () =>
      adminService.getPropertyManagement({
        page: 1,
        limit: 1,
        status: "PENDING",
      }),
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
  const support = useQuery({
    queryKey: ["admin", "navigation-indicators", "support"],
    queryFn: async () => {
      const [active, pending] = await Promise.all([
        chatService.getSessions("SUPPORT", "ACTIVE"),
        chatService.getPendingSupport(),
      ]);
      return {
        unread: active.reduce(
          (total, session) => total + session.unreadCount,
          0,
        ),
        pending: pending.length,
      };
    },
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const unreadNotifications =
    notifications.data?.notifications.filter((item) => !item.isRead).length ??
    0;
  const kycPending = kyc.data?.pending ?? 0;
  const propertyPending = properties.data?.stats.pendingReviews ?? 0;
  const supportUnread =
    (support.data?.unread ?? 0) + (support.data?.pending ?? 0);
  const operationalTotal = kycPending + propertyPending + supportUnread;

  return {
    unreadNotifications,
    kycPending,
    propertyPending,
    supportUnread,
    notificationTotal: Math.max(unreadNotifications, operationalTotal),
  };
}
