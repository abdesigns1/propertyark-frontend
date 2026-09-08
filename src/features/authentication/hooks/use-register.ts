import { useState } from "react";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const mutation = useMutation({
    mutationFn: (values: VendorRegisterValues) => {
      setUploadProgress(0);
      return authService.registerVendor(values, ({ loaded, total }) => {
        if (total) {
          setUploadProgress(Math.min(100, Math.round((loaded / total) * 100)));
        }
      });
    },
  });

  return { ...mutation, uploadProgress };
}
