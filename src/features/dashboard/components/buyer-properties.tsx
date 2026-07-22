"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { AnimatedContainer, AnimatedItem, FadeIn } from "@/components/motion";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  PropertyFilters,
  type PropertyFilterState,
} from "@/features/properties/components/property-filters";
import { useAllAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedPropertyCard } from "./recommended-property-card";

const DEFAULT_FILTERS: PropertyFilterState = {
  types: [],
  location: "",
  priceRange: [0, 100_000_000],
};
const PROPERTIES_PER_PAGE = 9;

const LISTING_TYPE_MAP: Record<string, string> = {
  Rent: "FOR_RENT",
  Sale: "FOR_SALE",
  Land: "FOR_LAND",
  Shortlet: "FOR_SHORTLET",
};

export function BuyerProperties() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const deferredFilters = useDeferredValue(filters);
  const backendFilters = useMemo(
    () => ({
      listingTypes: deferredFilters.types
        .map((type) => LISTING_TYPE_MAP[type])
        .filter(Boolean),
      city: deferredFilters.location.trim() || undefined,
      minPrice: deferredFilters.priceRange[0],
      maxPrice: deferredFilters.priceRange[1],
      search: searchParams.get("search")?.trim() || undefined,
    }),
    [deferredFilters, searchParams],
  );
  const availableProperties = useAllAvailableProperties(backendFilters);
  const properties = availableProperties.data ?? [];

  const totalPages = Math.max(
    1,
    Math.ceil(properties.length / PROPERTIES_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProperties = properties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE,
  );

  function handleFiltersChange(next: PropertyFilterState) {
    setFilters(next);
    setPage(1);
  }

  return (
    <>
      <FadeIn>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Properties
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Find properties that suit you, in any location according to your
              budget.
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal data-icon="inline-start" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[88vh] overflow-y-auto rounded-t-2xl"
            >
              <SheetHeader>
                <SheetTitle>Filter properties</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <PropertyFilters
                  onChange={handleFiltersChange}
                  className="border-0 p-0"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </FadeIn>

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="sticky top-24 hidden lg:block">
          <PropertyFilters onChange={handleFiltersChange} />
        </div>
        <div>
          {availableProperties.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-[410px] rounded-xl" />
              ))}
            </div>
          ) : availableProperties.isError ? (
            <Card className="py-12 text-center">
              <CardHeader>
                <CardTitle>Properties are temporarily unavailable</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Please refresh the page or try again shortly.
              </CardContent>
            </Card>
          ) : properties.length ? (
            <AnimatedContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProperties.map((property, index) => (
                <AnimatedItem key={`${property.id}-${index}`}>
                  <RecommendedPropertyCard
                    property={property}
                    index={index + 1}
                  />
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          ) : (
            <Card className="py-12 text-center">
              <CardHeader>
                <CardTitle>No properties match your filters</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Reset or adjust the filters to discover more listings.
              </CardContent>
            </Card>
          )}
          {properties.length > 0 && (
            <div className="mt-10 flex justify-center pb-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
