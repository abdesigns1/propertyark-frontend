"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/features/properties/components/property-card";
import { useAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedContainer,
  AnimatedItem,
  SlideInTop,
} from "@/components/motion";

export function FeaturedProperties() {
  const availableProperties = useAvailableProperties(1, 8);
  const featured = availableProperties.data?.properties.slice(0, 4) ?? [];

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
      <SlideInTop className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Premium Properties
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Top-rated listings verified by our on-ground experts.
          </p>
        </div>
        <Link
          href="/properties"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover sm:flex"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </SlideInTop>

      {availableProperties.isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[420px] rounded-xl" />
          ))}
        </div>
      ) : availableProperties.isError ? (
        <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Properties are temporarily unavailable.
        </p>
      ) : featured.length ? (
        <AnimatedContainer className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((property) => (
            <AnimatedItem key={property.id}>
              <PropertyCard property={property} />
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No available properties have been published yet.
        </p>
      )}

      <Link
        href="/properties"
        className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary-hover sm:hidden"
      >
        View All
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
