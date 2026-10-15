import { useMutation } from "@tanstack/react-query";
import type { ContactValues } from "@/features/messages/validation/contact.schema";
import { contactService } from "@/services/contact.service";

export function useContactForm() {
  return useMutation({
    mutationFn: (values: ContactValues) =>
      contactService.create({
        fullName: values.fullName,
        email: values.email,
        subject: values.subject,
        message: values.message,
      }),
  });
}
