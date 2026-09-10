"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllAvailableProperties } from "@/features/properties/hooks/use-available-properties";

function normalizedCity(city: string) {
  return city.trim() || "Unspecified market";
}

export function HeroMarketActivity() {
  const propertiesQuery = useAllAvailableProperties();
  const insight = useMemo(() => {
    const properties = propertiesQuery.data ?? [];
    if (!properties.length) return null;

    const cityCounts = new Map<string, number>();
    properties.forEach((property) => {
      const city = normalizedCity(property.location.city);
      cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
    });

    const [leadingCity, listingCount] = [...cityCounts.entries()].sort(
      ([cityA, countA], [cityB, countB]) =>
        countB - countA || cityA.localeCompare(cityB),
    )[0];

    return {
      leadingCity,
      listingCount,
      totalListings: properties.length,
      marketShare: Math.round((listingCount / properties.length) * 100),
    };
  }, [propertiesQuery.data]);

  return (
    <div className="absolute -bottom-8 left-4 w-64 rounded-xl bg-card p-4 shadow-xl sm:-bottom-10 sm:left-8">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-success" />
        {propertiesQuery.isLoading
          ? "Loading market insight"
          : insight
            ? `${insight.leadingCity} Market Share`
            : "Market Insights"}
      </div>

      {propertiesQuery.isLoading ? (
        <div
          className="mt-2 flex flex-col gap-2"
          aria-label="Loading market insight"
        >
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : insight ? (
        <>
          <div className="mt-1 flex items-center gap-1.5">
            <TrendingUp aria-hidden="true" className="size-4 text-primary" />
            <span className="font-numeric text-xl font-semibold text-primary">
              {insight.marketShare}%
            </span>
          </div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {insight.leadingCity} leads with {insight.listingCount} of{" "}
            {insight.totalListings} active listings.
          </p>
        </>
      ) : (
        <>
          <p className="mt-1 font-numeric text-xl font-semibold text-primary">
            Live data
          </p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            Marketplace insights are updating.
          </p>
        </>
      )}
    </div>
  );
}
