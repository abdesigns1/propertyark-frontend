import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { professionalServiceService } from "@/services/professional-service.service";

export const professionalServiceKeys = {
  all: ["admin", "professional-services"] as const,
  detail: (id: string) => ["admin", "professional-services", id] as const,
};

export function useAdminProfessionalServices() {
  return useQuery({
    queryKey: professionalServiceKeys.all,
    queryFn: professionalServiceService.getAll,
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useAdminProfessionalService(id: string) {
  return useQuery({
    queryKey: professionalServiceKeys.detail(id),
    queryFn: () => professionalServiceService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useDeleteProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: professionalServiceService.deleteById,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({
        queryKey: professionalServiceKeys.detail(id),
      });
      void queryClient.invalidateQueries({
        queryKey: professionalServiceKeys.all,
      });
    },
  });
}
