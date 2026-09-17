import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { LoginValues } from "@/features/authentication/validation/login.schema";

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginValues) => authService.login(values),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}
