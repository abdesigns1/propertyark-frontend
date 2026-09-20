"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import type { AvailablePropertyFilters } from "@/services/property.service";

export function useAvailableProperties(page = 1, limit = 12) {
  return useQuery({
    queryKey: ["properties", "available", page, limit],
    queryFn: () => propertyService.getAvailable({ page, limit }),
    staleTime: 2 * 60_000,
    refetchOnReconnect: true,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ["properties", "featured"],
    queryFn: propertyService.getFeatured,
    staleTime: 2 * 60_000,
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
    staleTime: 2 * 60_000,
    refetchOnReconnect: true,
  });
}

export function useAllAvailableProperties(
  filters: AvailablePropertyFilters = {},
) {
  return useQuery({
    queryKey: ["properties", "available", "all", filters],
    queryFn: () => propertyService.getAllAvailable(filters),
    staleTime: 5 * 60_000,
    refetchOnReconnect: true,
  });
}
