"use client";

import { Suspense } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageBanner } from "@/components/shared/page-banner";
import { PropertySearchForm } from "@/components/shared/property-search-form";
import {
  PropertyFilters,
  PropertyFilterState,
} from "@/features/properties/components/property-filters";
import { PropertyCard } from "@/features/properties/components/property-card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { BecomeVendorBanner } from "@/components/contact/become-vendor-banner";
import { Footer } from "@/components/shared/footer";
import { CONTAINER, cn } from "@/lib/utils";
import { AnimatedContainer, AnimatedItem } from "@/components/motion";
import { useAllAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import { Skeleton } from "@/components/ui/skeleton";

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

// Reverse mapping: the "type" query param value -> checkbox label used in the sidebar
const QUERY_TYPE_TO_LABEL: Record<string, string> = {
  rent: "Rent",
  sale: "Sale",
  land: "Land",
  shortlet: "Shortlet",
};

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFilterState>(DEFAULT_FILTERS);
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

  // Sync filters whenever the URL's query params change (e.g. after a search from the Hero)
  /* eslint-disable react-hooks/set-state-in-effect -- URL query parameters are external navigation state. */
  useEffect(() => {
    const location = searchParams.get("location") ?? "";
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    setFilters({
      types:
        type && QUERY_TYPE_TO_LABEL[type] ? [QUERY_TYPE_TO_LABEL[type]] : [],
      location,
      priceRange: [
        minPrice ? Number(minPrice) : DEFAULT_FILTERS.priceRange[0],
        maxPrice ? Number(maxPrice) : DEFAULT_FILTERS.priceRange[1],
      ],
    });
    setPage(1);
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filteredProperties = availableProperties.data ?? [];

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE,
  );

  function handleFiltersChange(next: PropertyFilterState) {
    setFilters(next);
    setPage(1);
  }

  return (
    <>
      <PageBanner
        title="Properties"
        description="Find Properties that suits you, in any location according to your budget"
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600"
        imageAlt="Residential neighborhood"
        belowContent={<PropertySearchForm />}
      />

      <section
        className={cn(
          CONTAINER,
          "grid grid-cols-1 gap-8 pb-20 pt-24 lg:grid-cols-[280px_1fr]",
        )}
      >
        <PropertyFilters onChange={handleFiltersChange} />

        <div>
          {availableProperties.isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : availableProperties.isError ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-medium">Unable to load properties</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please try again shortly.
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="text-sm font-medium text-foreground">
                No properties match your filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <AnimatedContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProperties.map((property) => (
                <AnimatedItem key={property.id}>
                  <PropertyCard property={property} />
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          )}

          {filteredProperties.length > 0 && (
            <div className="mt-10 flex justify-center">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </section>

      <BecomeVendorBanner />
      <Footer />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PropertiesContent />
    </Suspense>
  );
}
