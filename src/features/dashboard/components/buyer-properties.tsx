"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import type { Property } from "@/features/properties/types";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedPropertyCard } from "./recommended-property-card";

const DEFAULT_FILTERS: PropertyFilterState = {
  types: [],
  location: "",
  priceRange: [0, 100_000_000],
};
const PROPERTIES_PER_PAGE = 9;

function normalizedFilterText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesText(value: string, query: string) {
  const normalizedQuery = normalizedFilterText(query);
  if (!normalizedQuery) return true;
  return normalizedFilterText(value).includes(normalizedQuery);
}

function propertyLocationText(property: Property) {
  return [
    property.location.address,
    property.location.city,
    property.location.state,
    property.location.country,
  ]
    .filter(Boolean)
    .join(" ");
}

function matchesPropertyType(property: Property, type: string) {
  if (type === "Rent") return property.purpose === "rent";
  if (type === "Sale") return property.purpose === "sale";
  if (type === "Land") return property.purpose === "land";
  if (type === "Shortlet") return property.purpose === "shortlet";
  if (type === "Joint Venture") {
    return matchesText(
      [property.title, property.description, property.amenities?.join(" ")]
        .filter(Boolean)
        .join(" "),
      "joint venture",
    );
  }
  return false;
}

export function BuyerProperties() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search")?.trim() ?? "",
  );
  const deferredFilters = useDeferredValue(filters);

  /* eslint-disable react-hooks/set-state-in-effect -- URL search is external navigation state. */
  useEffect(() => {
    setSearchQuery(searchParams.get("search")?.trim() ?? "");
    setPage(1);
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */
  const availableProperties = useAllAvailableProperties();
  const matchingProperties = useMemo(
    () =>
      (availableProperties.data ?? [])
        .filter(
          (property) =>
            deferredFilters.types.length === 0 ||
            deferredFilters.types.some((type) =>
              matchesPropertyType(property, type),
            ),
        )
        .filter((property) =>
          matchesText(propertyLocationText(property), deferredFilters.location),
        )
        .filter((property) => {
          const [minimum, maximum] = deferredFilters.priceRange;
          const meetsMinimum =
            minimum === DEFAULT_FILTERS.priceRange[0] ||
            property.price >= minimum;
          const meetsMaximum =
            maximum === DEFAULT_FILTERS.priceRange[1] ||
            property.price <= maximum;
          return meetsMinimum && meetsMaximum;
        })
        .filter((property) =>
          matchesText(
            [
              property.title,
              property.description,
              property.type,
              property.purpose,
              propertyLocationText(property),
            ].join(" "),
            searchQuery,
          ),
        ),
    [availableProperties.data, deferredFilters, searchQuery],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(matchingProperties.length / PROPERTIES_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const properties = matchingProperties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE,
  );

  function handleFiltersChange(next: PropertyFilterState) {
    setFilters(next);
    setPage(1);
  }

  function handleFiltersReset() {
    setSearchQuery("");
    router.replace(pathname, { scroll: false });
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
                  value={filters}
                  onChange={handleFiltersChange}
                  onReset={handleFiltersReset}
                  className="border-0 p-0"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </FadeIn>

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="sticky top-24 hidden lg:block">
          <PropertyFilters
            value={filters}
            onChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
        </div>
        <div className="min-w-0">
          {availableProperties.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
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
            <AnimatedContainer className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {properties.map((property, index) => (
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
          {properties.length > 0 && totalPages > 1 && (
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
