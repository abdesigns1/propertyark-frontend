"use client";

import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { PropertyCard } from "@/features/properties/components/property-card";
import { getRecentlyViewedPropertyIds } from "@/features/properties/lib/recently-viewed-properties";
import { useAccountKey } from "@/lib/account-identity";
import { buyerDashboardService } from "@/services/buyer-dashboard.service";
import { propertyService } from "@/services/property.service";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentlyViewedProperties() {
  const accountKey = useAccountKey();
  const query = useQuery({
    queryKey: ["buyer", "recently-viewed-properties", accountKey],
    enabled: Boolean(accountKey),
    queryFn: async () => {
      const [activityIds, available] = await Promise.all([
        buyerDashboardService.getRecentlyViewedPropertyIds().catch(() => []),
        propertyService.getAvailable({ page: 1, limit: 1000 }),
      ]);
      const orderedIds = [
        ...new Set([
          ...activityIds,
          ...getRecentlyViewedPropertyIds(accountKey ?? "anonymous"),
        ]),
      ];
      const propertiesById = new Map(
        available.properties.map((property) => [property.id, property]),
      );
      return orderedIds
        .map((id) => propertiesById.get(id))
        .filter((property) => property !== undefined)
        .slice(0, 3);
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  if (!accountKey) return null;

  if (query.isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!query.data?.length) {
    return (
      <Empty className="min-h-64 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>No recently viewed properties</EmptyTitle>
          <EmptyDescription>
            Properties you open while signed in will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {query.data.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
