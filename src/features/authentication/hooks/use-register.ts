import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type {
  BuyerRegisterValues,
  VendorRegisterValues,
} from "@/features/authentication/validation/register.schema";

export function useRegisterBuyer() {
  return useMutation({
    mutationFn: (values: BuyerRegisterValues) =>
      authService.registerBuyer(values),
  });
}

export function useRegisterVendor() {
  return useMutation({
    mutationFn: (values: VendorRegisterValues) =>
      authService.registerVendor(values),
  });
}
