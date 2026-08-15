import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

const notificationKey = ["admin", "notifications"] as const;

export function useAdminNotifications(page: number) {
  return useQuery({
    queryKey: [...notificationKey, "list", page],
    queryFn: () => notificationService.getMine(page, 20),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
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
