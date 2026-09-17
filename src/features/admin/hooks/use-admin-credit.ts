import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreditService,
  type CreditPointSettings,
} from "@/services/admin-credit.service";

const settingsKey = ["admin", "credit-points", "settings"] as const;

export function useAdminCreditSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: adminCreditService.getSettings,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useUpdateAdminCreditSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: CreditPointSettings) =>
      adminCreditService.updateSettings(settings),
    onSuccess: (settings) => queryClient.setQueryData(settingsKey, settings),
  });
}
