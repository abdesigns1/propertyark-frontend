"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import type { AvailablePropertyFilters } from "@/services/property.service";

export function useAvailableProperties(page = 1, limit = 12) {
  return useQuery({
    queryKey: ["properties", "available", page, limit],
    queryFn: () => propertyService.getAvailable({ page, limit }),
    staleTime: 15_000,
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
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
