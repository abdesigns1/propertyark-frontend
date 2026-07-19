import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { LoginValues } from "@/features/authentication/validation/login.schema";

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginValues) => authService.login(values),
  });
}
