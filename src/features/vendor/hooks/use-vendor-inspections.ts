"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccountKey } from "@/lib/account-identity";
import { getApiErrorMessage } from "@/services/api-error";
import { inspectionService } from "@/services/inspection.service";

export function vendorInspectionsQueryKey(accountKey: string) {
  return ["vendor", "inspections", accountKey] as const;
}

export function useVendorInspections() {
  const accountKey = useAccountKey();
  return useQuery({
    queryKey: vendorInspectionsQueryKey(accountKey ?? "unresolved-session"),
    queryFn: inspectionService.getVendorInspections,
    enabled: Boolean(accountKey),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useReviewInspection() {
  const accountKey = useAccountKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inspectionService.review,
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === "ACCEPTED"
          ? "Inspection request approved."
          : "Inspection request declined.",
      );
      queryClient.invalidateQueries({
        queryKey: vendorInspectionsQueryKey(accountKey ?? "unresolved-session"),
      });
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The inspection request could not be updated."),
      ),
  });
}

export function useScheduleInspection() {
  const accountKey = useAccountKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inspectionService.schedule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vendorInspectionsQueryKey(accountKey ?? "unresolved-session"),
      });
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The inspection could not be scheduled."),
      ),
  });
}
