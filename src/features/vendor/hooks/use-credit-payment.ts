import { useMutation, useQuery } from "@tanstack/react-query";
import { creditPaymentService } from "@/services/credit-payment.service";

export const creditPaymentKeys = {
  all: ["vendor-credit-points"] as const,
  info: ["vendor-credit-points", "info"] as const,
  verification: (reference: string) =>
    ["vendor-credit-points", "verification", reference] as const,
};

export function useCreditInfo(enabled = true) {
  return useQuery({
    queryKey: creditPaymentKeys.info,
    queryFn: creditPaymentService.getCreditInfo,
    staleTime: 30_000,
    retry: 1,
    enabled,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useCalculateCreditPurchase() {
  return useMutation({
    mutationFn: creditPaymentService.calculatePurchase,
  });
}

export function useInitializeCreditPurchase() {
  return useMutation({
    mutationFn: creditPaymentService.initializePurchase,
  });
}

export function useVerifyCreditPurchase(reference: string | null) {
  return useQuery({
    queryKey: creditPaymentKeys.verification(reference ?? "missing"),
    queryFn: () => creditPaymentService.verifyPurchase(reference!),
    enabled: Boolean(reference),
    retry: 2,
    retryDelay: (attempt) => Math.min(1_500 * 2 ** attempt, 6_000),
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data?.state === "pending" ? 3_000 : false,
  });
}
