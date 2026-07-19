import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { authService } from "@/services/auth.service";
import type { VerifyValues } from "@/features/authentication/validation/verify.schema";

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function shouldRetryUnavailableService(failureCount: number, error: unknown) {
  if (failureCount >= 2 || !axios.isAxiosError(error)) return false;

  return !error.response || RETRYABLE_STATUSES.has(error.response.status);
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: (values: VerifyValues) => authService.verify(values),
    retry: shouldRetryUnavailableService,
    retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 8_000),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    retry: shouldRetryUnavailableService,
    retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 8_000),
  });
}
