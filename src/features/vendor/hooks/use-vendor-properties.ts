"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { propertyService } from "@/services/property.service";
import { useAccountKey } from "@/lib/account-identity";

export function vendorPropertiesQueryKey(accountKey: string) {
  return ["vendor", "properties", accountKey] as const;
}

export function useVendorProperties() {
  const accountKey = useAccountKey();

  return useQuery({
    queryKey: vendorPropertiesQueryKey(accountKey ?? "unresolved-session"),
    queryFn: () => propertyService.getVendorProperties({ page: 1, limit: 100 }),
    enabled: Boolean(accountKey),
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
