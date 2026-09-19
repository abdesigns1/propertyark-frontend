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
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useAdminAllActivities(entityType = "ALL") {
  return useQuery({
    queryKey: ["admin", "activities", "all", entityType],
    queryFn: async () => {
      const limit = 100;
      const filters = {
        limit,
        entityType: entityType === "ALL" ? undefined : entityType,
      };
      const firstPage = await activityService.getAll({ ...filters, page: 1 });
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.pages - 1) },
          (_, index) => activityService.getAll({ ...filters, page: index + 2 }),
        ),
      );
      return [firstPage, ...remainingPages].flatMap((page) => page.activities);
    },
    refetchOnWindowFocus: false,
    staleTime: 60_000,
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
