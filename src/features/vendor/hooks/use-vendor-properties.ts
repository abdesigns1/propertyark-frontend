"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { propertyService } from "@/services/property.service";

export function useVendorProperties() {
  return useQuery({
    queryKey: ["vendor", "properties"],
    queryFn: () => propertyService.getVendorProperties({ page: 1, limit: 100 }),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status < 500
      )
        return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
