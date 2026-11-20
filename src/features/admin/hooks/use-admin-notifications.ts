import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

const notificationKey = ["admin", "notifications"] as const;

export function useAdminNotifications(enabled = true) {
  return useQuery({
    queryKey: [...notificationKey, "list", "all"],
    queryFn: () => notificationService.getAllMine(100),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useAdminNotificationStats() {
  return useQuery({
    queryKey: [...notificationKey, "stats"],
    queryFn: notificationService.getAdminStats,
    staleTime: 30_000,
  });
}

export function useMarkAdminNotificationRead() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKey }),
  });
}

export function useMarkAllAdminNotificationsRead() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKey }),
  });
}
