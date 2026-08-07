"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import type { AvailablePropertyFilters } from "@/services/property.service";

export function useAvailableProperties(page = 1, limit = 12) {
  return useQuery({
    queryKey: ["properties", "available", page, limit],
    queryFn: () => propertyService.getAvailable({ page, limit }),
    staleTime: 15_000,
    refetchOnMount: "always",
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function usePaginatedAvailableProperties({
  page,
  limit,
  filters,
}: {
  page: number;
  limit: number;
  filters: AvailablePropertyFilters;
}) {
  return useQuery({
    queryKey: ["properties", "available", "page", page, limit, filters],
    queryFn: () => propertyService.getAvailablePage({ page, limit, filters }),
    placeholderData: (previousData) => previousData,
    staleTime: 15_000,
    refetchOnMount: "always",
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useAllAvailableProperties(
  filters: AvailablePropertyFilters = {},
) {
  return useQuery({
    queryKey: ["properties", "available", "all", filters],
    queryFn: () => propertyService.getAllAvailable(filters),
    staleTime: 15_000,
    refetchOnMount: "always",
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
