"use client";

import { Suspense } from "react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, SlidersHorizontal } from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import {
  PropertyFilters,
  PropertyFilterState,
} from "@/features/properties/components/property-filters";
import { PropertyCard } from "@/features/properties/components/property-card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { BecomeVendorBanner } from "@/components/contact/become-vendor-banner";
import { Footer } from "@/components/shared/footer";
import { CONTAINER, cn } from "@/lib/utils";
import { usePaginatedAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

const PROPERTY_CATEGORY_MAP: Record<string, string> = {
  residential: "RESIDENTIAL",
  commercial: "COMMERCIAL",
  industrial: "INDUSTRIAL",
  "mixed-use": "MIXED_USE",
};

function PropertiesContent() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routePurpose =
    pathname === "/shortlets"
      ? "shortlet"
      : (searchParams.get("purpose") ?? searchParams.get("type"));
  const [page, setPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<PropertyFilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search")?.trim() ?? "",
  );
  const propertyCategory = searchParams.get("category") ?? "";
  const bedrooms = Number(searchParams.get("bedrooms")) || undefined;
  const hasExplicitMaxPrice = searchParams.has("maxPrice");
  const deferredFilters = useDeferredValue(filters);
  const backendFilters = useMemo(
    () => ({
      listingTypes: deferredFilters.types
        .map((type) => LISTING_TYPE_MAP[type])
        .filter(Boolean),
      propertyTypes: PROPERTY_CATEGORY_MAP[propertyCategory]
        ? [PROPERTY_CATEGORY_MAP[propertyCategory]]
        : [],
      city: deferredFilters.location.trim() || undefined,
      minPrice:
        deferredFilters.priceRange[0] > DEFAULT_FILTERS.priceRange[0]
          ? deferredFilters.priceRange[0]
          : undefined,
      maxPrice:
        hasExplicitMaxPrice ||
        deferredFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]
          ? deferredFilters.priceRange[1]
          : undefined,
      bedrooms,
      search: searchQuery || undefined,
    }),
    [
      bedrooms,
      deferredFilters,
      hasExplicitMaxPrice,
      propertyCategory,
      searchQuery,
    ],
  );
  const availableProperties = usePaginatedAvailableProperties({
    page,
    limit: PROPERTIES_PER_PAGE,
    filters: backendFilters,
  });

  // Sync filters whenever the URL's query params change (e.g. after a search from the Hero)
  /* eslint-disable react-hooks/set-state-in-effect -- URL query parameters are external navigation state. */
  useEffect(() => {
    const location = searchParams.get("location") ?? "";
    const type =
      pathname === "/shortlets"
        ? "shortlet"
        : (searchParams.get("purpose") ?? searchParams.get("type"));
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    setSearchQuery(searchParams.get("search")?.trim() ?? "");
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
  }, [pathname, searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filteredProperties = availableProperties.data?.properties ?? [];
  const totalPages = Math.max(
    1,
    availableProperties.data?.pagination.pages ?? 1,
  );
  const currentPage = Math.min(page, totalPages);
  const totalProperties = availableProperties.data?.pagination.total ?? 0;
  const firstVisibleProperty = totalProperties
    ? (currentPage - 1) * PROPERTIES_PER_PAGE + 1
    : 0;
  const lastVisibleProperty = Math.min(
    currentPage * PROPERTIES_PER_PAGE,
    totalProperties,
  );
  const activeFilterCount =
    filters.types.length +
    Number(Boolean(filters.location.trim())) +
    Number(filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0]) +
    Number(filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) +
    Number(Boolean(propertyCategory)) +
    Number(Boolean(bedrooms)) +
    Number(Boolean(searchQuery));

  function handleFiltersChange(next: PropertyFilterState) {
    setFilters(next);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage === currentPage) return;

    setPage(nextPage);
    window.requestAnimationFrame(() => {
      resultsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleFiltersReset() {
    setSearchQuery("");
    void queryClient.invalidateQueries({
      queryKey: ["properties", "available"],
    });
    router.replace(pathname, { scroll: false });
  }

  return (
    <>
      <PageBanner
        title={
          routePurpose === "sale"
            ? "Properties For Sale"
            : routePurpose === "rent"
              ? "Properties For Rent"
              : routePurpose === "shortlet"
                ? "Shortlet Properties"
                : "Properties"
        }
        description={
          routePurpose === "shortlet"
            ? "Discover comfortable shortlet stays available for your next trip"
            : "Find properties that suit you, in any location according to your budget"
        }
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600"
        imageAlt="Residential neighborhood"
        // belowContent={<PropertySearchForm />}
      />

      <section className="bg-muted/25">
        <div
          className={cn(
            CONTAINER,
            "grid grid-cols-1 gap-8 py-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-16",
          )}
        >
          <PropertyFilters
            value={filters}
            onChange={handleFiltersChange}
            onReset={handleFiltersReset}
            className="sticky top-28 hidden lg:block"
          />

          <div ref={resultsTopRef} className="min-w-0 scroll-mt-28">
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      Available properties
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {availableProperties.isLoading
                      ? "Loading current listings…"
                      : totalProperties
                        ? `Showing ${firstVisibleProperty}–${lastVisibleProperty} of ${totalProperties.toLocaleString()} listings`
                        : "Browse verified listings across PropertyArk"}
                  </p>
                </div>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal data-icon="inline-start" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader className="border-b">
                    <SheetTitle>Filter properties</SheetTitle>
                    <SheetDescription>
                      Refine the listings by purpose, location, and price.
                    </SheetDescription>
                  </SheetHeader>
                  <PropertyFilters
                    value={filters}
                    onChange={handleFiltersChange}
                    onReset={handleFiltersReset}
                    className="border-0 shadow-none"
                  />
                  <SheetFooter className="border-t bg-background">
                    <SheetClose asChild>
                      <Button>
                        View {totalProperties.toLocaleString()} properties
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Active filters:
                </span>
                {filters.types.map((type) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
                {filters.location && (
                  <Badge variant="outline">{filters.location}</Badge>
                )}
                {searchQuery && (
                  <Badge variant="outline">Search: {searchQuery}</Badge>
                )}
                {(filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
                  filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) && (
                  <Badge variant="outline">Custom price range</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleFiltersReset}>
                  Clear all
                </Button>
              </div>
            )}

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
              <div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                aria-live="polite"
              >
                {filteredProperties.map((property) => (
                  <div key={property.id}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}

            {filteredProperties.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex justify-center rounded-2xl border bg-card px-4 py-5 shadow-sm">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
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
