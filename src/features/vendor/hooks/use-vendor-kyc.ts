"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountKey } from "@/lib/account-identity";
import {
  hasRememberedVendorKycSubmission,
  rememberVendorKycSubmission,
  vendorKycService,
  type VendorKycState,
} from "@/services/vendor-kyc.service";

export function vendorKycQueryKey(accountKey: string) {
  return ["vendor", "kyc", accountKey] as const;
}

export function useVendorKyc() {
  const accountKey = useAccountKey();
  const queryClient = useQueryClient();
  const queryKey = vendorKycQueryKey(accountKey ?? "unresolved-session");

  return useQuery({
    queryKey,
    queryFn: async () => {
      const latest = await vendorKycService.getStatus();
      const previous = queryClient.getQueryData<VendorKycState>(queryKey);
      const submittedInThisBrowser = accountKey
        ? hasRememberedVendorKycSubmission(accountKey)
        : false;

      if (accountKey && latest.status === "PENDING" && latest.hasDocument) {
        rememberVendorKycSubmission(accountKey);
      }

      // The profile endpoint may return PENDING while omitting the private NIN
      // URL. A missing URL is not evidence that a submitted document vanished.
      // Preserve the known pending submission until the backend explicitly
      // returns VERIFIED, REJECTED, or NOT_SUBMITTED.
      if (
        latest.reportedStatus === "PENDING" &&
        !latest.hasDocument &&
        ((previous?.status === "PENDING" && previous.hasDocument) ||
          submittedInThisBrowser)
      ) {
        return {
          ...latest,
          status: "PENDING" as const,
          hasDocument: true,
        };
      }

      return latest;
    },
    enabled: Boolean(accountKey),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
