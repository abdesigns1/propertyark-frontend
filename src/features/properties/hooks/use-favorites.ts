"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  favoriteService,
  type FavoritesResult,
} from "@/services/favorite.service";
import { useAccountKey } from "@/lib/account-identity";

function favoritesQueryKey(ownerKey: string) {
  return ["favorites", "authenticated-user", ownerKey] as const;
}

export function useFavorites(enabled = true) {
  const ownerKey = useAccountKey();

  return useQuery({
    queryKey: favoritesQueryKey(ownerKey ?? "unresolved-session"),
    queryFn: () => favoriteService.getAll({ page: 1, limit: 1000 }),
    enabled: enabled && Boolean(ownerKey),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const ownerKey = useAccountKey();
  const queryKey = favoritesQueryKey(ownerKey ?? "unresolved-session");

  return useMutation({
    mutationFn: ({
      propertyId,
      save,
    }: {
      propertyId: string;
      save: boolean;
    }) =>
      save
        ? favoriteService.add(propertyId)
        : favoriteService.remove(propertyId),
    onMutate: async ({ propertyId, save }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FavoritesResult>(queryKey);

      queryClient.setQueryData<FavoritesResult>(queryKey, (current) => {
        if (!current) return current;
        const propertyIds = save
          ? Array.from(new Set([...current.propertyIds, propertyId]))
          : current.propertyIds.filter((id) => id !== propertyId);
        return {
          ...current,
          propertyIds,
          properties: save
            ? current.properties
            : current.properties.filter(
                (property) => property.id !== propertyId,
              ),
          pagination: {
            ...current.pagination,
            total: propertyIds.length,
          },
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
