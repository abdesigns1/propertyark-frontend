import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/axios";
import type { ContactValues } from "@/features/messages/validation/contact.schema";

export function useContactForm() {
  return useMutation({
    mutationFn: (values: ContactValues) => api.post("/contact", values),
  });
}
