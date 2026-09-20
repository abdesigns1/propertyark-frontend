"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccountKey } from "@/lib/account-identity";
import { vendorKycService } from "@/services/vendor-kyc.service";

export function vendorKycQueryKey(accountKey: string) {
  return ["vendor", "kyc", accountKey] as const;
}

export function useVendorKyc() {
  const accountKey = useAccountKey();

  return useQuery({
    queryKey: vendorKycQueryKey(accountKey ?? "unresolved-session"),
    queryFn: vendorKycService.getStatus,
    enabled: Boolean(accountKey),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
