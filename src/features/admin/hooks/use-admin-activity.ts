import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";

export function useAdminActivities(page = 1, limit = 20, entityType = "ALL") {
  return useQuery({
    queryKey: ["admin", "activities", page, limit, entityType],
    queryFn: () =>
      activityService.getAll({
        page,
        limit,
        entityType: entityType === "ALL" ? undefined : entityType,
      }),
    placeholderData: (previous) => previous,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useAdminActivity(activityId: string) {
  return useQuery({
    queryKey: ["admin", "activity", activityId],
    queryFn: () => activityService.getById(activityId),
    enabled: Boolean(activityId),
    staleTime: 15_000,
  });
}
