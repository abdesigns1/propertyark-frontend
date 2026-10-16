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
import { useAllAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import type { Property } from "@/features/properties/types";
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

const LISTING_TYPE_MAP: Record<string, string[]> = {
  Rent: ["FOR_RENT"],
  // Land is modeled as a separate listing type by the API, but it is still a
  // sale listing from a buyer's perspective and must appear under For Sale.
  Sale: ["FOR_SALE", "FOR_LAND"],
  Land: ["FOR_LAND"],
  // Joint Venture is a temporary frontend-only classification. Do not send an
  // unsupported listing type to the API; matching is applied locally below.
  "Joint Venture": [],
  Shortlet: ["FOR_SHORTLET"],
};

// Reverse mapping: the "type" query param value -> checkbox label used in the sidebar
const QUERY_TYPE_TO_LABEL: Record<string, string> = {
  rent: "Rent",
  sale: "Sale",
  land: "Land",
  "joint-venture": "Joint Venture",
  shortlet: "Shortlet",
};

const PROPERTY_CATEGORY_MAP: Record<string, string> = {
  residential: "RESIDENTIAL",
  commercial: "COMMERCIAL",
  industrial: "INDUSTRIAL",
  "mixed-use": "MIXED_USE",
};

// Higher-value fields have a stronger influence on search ordering. Exact
// phrases and complete-field matches receive additional bonuses below.
const SEARCH_FIELD_WEIGHTS = {
  title: 500,
  city: 140,
  state: 120,
  address: 100,
  country: 40,
  type: 35,
  purpose: 35,
  description: 20,
  amenities: 15,
} as const;

function normalizedLocation(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function editDistance(first: string, second: string) {
  const previous = Array.from(
    { length: second.length + 1 },
    (_, index) => index,
  );
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        current[secondIndex - 1] + 1,
        previous[secondIndex] + 1,
        previous[secondIndex - 1] +
          (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length];
}

function matchesNormalizedWords(value: string, keyword: string) {
  const query = normalizedLocation(keyword);
  if (!query) return true;
  const normalizedValue = normalizedLocation(value);
  if (normalizedValue.includes(query)) return true;

  const valueWords = normalizedValue.split(" ").filter(Boolean);
  return query.split(" ").every((queryWord) =>
    valueWords.some((valueWord) => {
      if (valueWord.includes(queryWord) || queryWord.includes(valueWord)) {
        return true;
      }
      const allowedDistance =
        queryWord.length >= 7 ? 2 : queryWord.length >= 4 ? 1 : 0;
      return editDistance(queryWord, valueWord) <= allowedDistance;
    }),
  );
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

function matchesLocationKeyword(property: Property, keyword: string) {
  return matchesNormalizedWords(propertyLocationText(property), keyword);
}

function matchesSearchKeyword(property: Property, keyword: string) {
  return matchesNormalizedWords(
    [
      property.title,
      property.description,
      property.type,
      property.purpose,
      propertyLocationText(property),
    ]
      .filter(Boolean)
      .join(" "),
    keyword,
  );
}

function matchesJointVenture(property: Property) {
  return matchesNormalizedWords(
    [property.title, property.description, property.amenities?.join(" ")]
      .filter(Boolean)
      .join(" "),
    "joint venture",
  );
}

function countPhraseOccurrences(value: string, phrase: string) {
  let count = 0;
  let searchFrom = 0;

  while (searchFrom < value.length) {
    const matchIndex = value.indexOf(phrase, searchFrom);
    if (matchIndex === -1) break;

    count += 1;
    searchFrom = matchIndex + phrase.length;
  }

  return count;
}

function searchFieldRelevance(
  value: string | undefined,
  normalizedQuery: string,
  weight: number,
) {
  if (!value) return 0;

  const normalizedValue = normalizedLocation(value);
  if (!normalizedValue) return 0;

  const phraseOccurrences = countPhraseOccurrences(
    normalizedValue,
    normalizedQuery,
  );
  let score = phraseOccurrences * weight;

  if (normalizedValue === normalizedQuery) {
    score += weight * 4;
  } else if (normalizedValue.startsWith(normalizedQuery)) {
    score += weight * 3;
  } else if (phraseOccurrences > 0) {
    score += weight * 2;
  }

  const fieldWords = normalizedValue.split(" ").filter(Boolean);
  for (const queryWord of normalizedQuery.split(" ").filter(Boolean)) {
    if (fieldWords.includes(queryWord)) {
      score += weight;
    } else if (
      fieldWords.some(
        (fieldWord) =>
          fieldWord.includes(queryWord) || queryWord.includes(fieldWord),
      )
    ) {
      score += Math.round(weight / 2);
    }
  }

  return score;
}

function propertySearchRelevance(property: Property, keyword: string) {
  const normalizedQuery = normalizedLocation(keyword);
  if (!normalizedQuery) return 0;

  const weightedFields: Array<[string | undefined, number]> = [
    [property.title, SEARCH_FIELD_WEIGHTS.title],
    [property.location.city, SEARCH_FIELD_WEIGHTS.city],
    [property.location.state, SEARCH_FIELD_WEIGHTS.state],
    [property.location.address, SEARCH_FIELD_WEIGHTS.address],
    [property.location.country, SEARCH_FIELD_WEIGHTS.country],
    [property.type, SEARCH_FIELD_WEIGHTS.type],
    [property.purpose, SEARCH_FIELD_WEIGHTS.purpose],
    [property.description, SEARCH_FIELD_WEIGHTS.description],
    [property.amenities?.join(" "), SEARCH_FIELD_WEIGHTS.amenities],
  ];

  return weightedFields.reduce(
    (total, [value, weight]) =>
      total + searchFieldRelevance(value, normalizedQuery, weight),
    0,
  );
}

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
  // The production API currently does not apply its `search` parameter
  // consistently. Fetch the selected inventory and use the field-aware matcher
  // below so names, descriptions, cities, states, and addresses behave alike.
  const backendFilters = useMemo(
    () => ({
      listingTypes: deferredFilters.types
        .flatMap((type) => LISTING_TYPE_MAP[type] ?? [])
        .filter(Boolean),
      propertyTypes: PROPERTY_CATEGORY_MAP[propertyCategory]
        ? [PROPERTY_CATEGORY_MAP[propertyCategory]]
        : [],
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
    }),
    [bedrooms, deferredFilters, hasExplicitMaxPrice, propertyCategory],
  );
  const availableProperties = useAllAvailableProperties(backendFilters);

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

  const rankedProperties = useMemo(() => {
    const matchingProperties = (availableProperties.data ?? [])
      .filter((property) =>
        matchesLocationKeyword(property, deferredFilters.location),
      )
      .filter(
        (property) =>
          !deferredFilters.types.includes("Joint Venture") ||
          matchesJointVenture(property),
      )
      .filter((property) => matchesSearchKeyword(property, searchQuery));

    return matchingProperties
      .map((property) => ({
        property,
        relevance: propertySearchRelevance(property, searchQuery),
      }))
      .sort((first, second) => {
        if (second.relevance !== first.relevance) {
          return second.relevance - first.relevance;
        }

        const featuredDifference =
          Number(second.property.isFeatured === true) -
          Number(first.property.isFeatured === true);
        if (featuredDifference !== 0) return featuredDifference;

        return (
          new Date(second.property.createdAt).getTime() -
          new Date(first.property.createdAt).getTime()
        );
      })
      .map(({ property }) => property);
  }, [
    availableProperties.data,
    deferredFilters.location,
    deferredFilters.types,
    searchQuery,
  ]);
  const totalPages = Math.max(
    1,
    Math.ceil(rankedProperties.length / PROPERTIES_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const totalProperties = rankedProperties.length;
  const filteredProperties = rankedProperties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE,
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
            : routePurpose === "land"
              ? "Land For Sale"
              : routePurpose === "joint-venture"
                ? "Joint Venture Properties"
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
