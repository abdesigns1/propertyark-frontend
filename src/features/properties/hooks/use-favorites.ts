"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  favoriteService,
  type FavoritesResult,
} from "@/services/favorite.service";

export const FAVORITES_QUERY_KEY = ["favorites", "authenticated-user"] as const;

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => favoriteService.getAll({ page: 1, limit: 1000 }),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

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
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });
      const previous =
        queryClient.getQueryData<FavoritesResult>(FAVORITES_QUERY_KEY);

      queryClient.setQueryData<FavoritesResult>(
        FAVORITES_QUERY_KEY,
        (current) => {
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
        },
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY }),
  });
}
