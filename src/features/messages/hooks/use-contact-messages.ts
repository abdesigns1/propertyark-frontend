import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactService } from "@/services/contact.service";

export const contactMessageKeys = {
  all: ["admin", "contacts"] as const,
  detail: (id: string) => ["admin", "contacts", id] as const,
};

export function useAdminContactMessages() {
  return useQuery({
    queryKey: contactMessageKeys.all,
    queryFn: contactService.getAll,
  });
}

export function useAdminContactMessage(id: string) {
  return useQuery({
    queryKey: contactMessageKeys.detail(id),
    queryFn: () => contactService.getById(id),
    enabled: Boolean(id),
  });
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactService.deleteById,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: contactMessageKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: contactMessageKeys.all });
    },
  });
}
