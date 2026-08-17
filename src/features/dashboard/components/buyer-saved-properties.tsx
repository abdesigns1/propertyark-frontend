"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleSlash2, Filter, RotateCcw, Search } from "lucide-react";
import { AnimatedContainer, AnimatedItem, FadeIn } from "@/components/motion";
import { BecomeVendorBanner } from "@/components/contact/become-vendor-banner";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import { useFavorites } from "@/features/properties/hooks/use-favorites";
import { SimilarPropertiesCarousel } from "@/features/properties/components/similar-properties-carousel";
import { SavedPropertyCard } from "./saved-property-card";

const PAGE_SIZE = 5;

function SavedPropertiesEmpty({
  homeHref,
  exploreHref,
}: {
  homeHref: string;
  exploreHref: string;
}) {
  return (
    <FadeIn duration={0.5}>
      <Empty className="min-h-[calc(100vh-118px)] rounded-[3rem] border bg-card px-5">
        <EmptyMedia>
          <CircleSlash2 className="size-28 text-secondary" strokeWidth={1.8} />
        </EmptyMedia>
        <EmptyHeader className="max-w-2xl gap-5">
          <EmptyTitle className="text-3xl font-semibold md:text-4xl">
            No saved properties yet
          </EmptyTitle>
          <EmptyDescription className="max-w-xl text-base leading-7 md:text-lg">
            You haven&apos;t saved any properties. Start exploring available
            properties and bookmark the ones you love to easily find them later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-8 max-w-md flex-row justify-center gap-3">
          <Button
            variant="outline"
            className="min-w-40 border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary"
            asChild
          >
            <Link href={homeHref}>Go Home</Link>
          </Button>
          <Button className="min-w-40" asChild>
            <Link href={exploreHref}>Explore Properties</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </FadeIn>
  );
}

function SavedProperties({ audience }: { audience: "buyer" | "vendor" }) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [beds, setBeds] = useState("all");
  const [baths, setBaths] = useState("all");
  const favorites = useFavorites();
  const availableProperties = useAvailableProperties(1, 100);
  const savedIds = favorites.data?.propertyIds ?? [];
  const allProperties = useMemo(
    () => availableProperties.data?.properties ?? [],
    [availableProperties.data?.properties],
  );
  const savedProperties = useMemo(
    () => favorites.data?.properties ?? [],
    [favorites.data?.properties],
  );
  const filteredProperties = useMemo(
    () =>
      savedProperties.filter((property) => {
        if (
          query &&
          !`${property.title} ${property.location.address} ${property.location.city}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        if (status !== "all" && property.status !== status) return false;
        if (type !== "all" && property.type !== type) return false;
        if (beds !== "all" && property.bedrooms < Number(beds)) return false;
        if (baths !== "all" && property.bathrooms < Number(baths)) return false;
        return true;
      }),
    [baths, beds, query, savedProperties, status, type],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / PAGE_SIZE),
  );
  const properties = filteredProperties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const recommendations = allProperties
    .filter((property) => !savedIds.includes(property.id))
    .slice(0, 12);

  function resetFilters() {
    setSearchInput("");
    setQuery("");
    setStatus("all");
    setType("all");
    setBeds("all");
    setBaths("all");
    setPage(1);
  }

  if (favorites.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-12 w-72" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (favorites.isError) {
    return (
      <Empty className="min-h-[calc(100vh-118px)] rounded-[3rem] border">
        <EmptyHeader>
          <EmptyTitle>Saved properties are temporarily unavailable</EmptyTitle>
          <EmptyDescription>
            Please refresh the page or try again shortly.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!savedProperties.length) {
    return (
      <SavedPropertiesEmpty
        homeHref={`/${audience}/dashboard`}
        exploreHref={audience === "buyer" ? "/buyer/properties" : "/properties"}
      />
    );
  }

  return (
    <>
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Saved Properties
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Your shortlisted properties in one place. Review, compare, and
            continue your property search whenever you&apos;re ready.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="mb-7 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(4,130px)_44px_44px_110px]">
          <InputGroup className="h-10">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search saved properties"
              onKeyDown={(event) =>
                event.key === "Enter" && setQuery(searchInput)
              }
            />
          </InputGroup>
          <FilterSelect
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            placeholder="Status"
            options={[
              { value: "available", label: "Available" },
              { value: "under-offer", label: "Under offer" },
              { value: "sold", label: "Sold" },
            ]}
          />
          <FilterSelect
            value={type}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
            placeholder="Type"
            options={[
              { value: "duplex", label: "Duplex" },
              { value: "apartment", label: "Apartment" },
              { value: "land", label: "Land" },
            ]}
          />
          <FilterSelect
            value={beds}
            onChange={(value) => {
              setBeds(value);
              setPage(1);
            }}
            placeholder="Beds"
            options={[
              { value: "1", label: "1+ beds" },
              { value: "2", label: "2+ beds" },
              { value: "3", label: "3+ beds" },
            ]}
          />
          <FilterSelect
            value={baths}
            onChange={(value) => {
              setBaths(value);
              setPage(1);
            }}
            placeholder="Baths"
            options={[
              { value: "1", label: "1+ baths" },
              { value: "2", label: "2+ baths" },
              { value: "3", label: "3+ baths" },
            ]}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={resetFilters}
            aria-label="Reset filters"
          >
            <RotateCcw />
          </Button>
          <Button variant="outline" size="icon" aria-label="More filters">
            <Filter />
          </Button>
          <Button
            onClick={() => {
              setQuery(searchInput);
              setPage(1);
            }}
          >
            Search
          </Button>
        </div>
      </FadeIn>

      {filteredProperties.length ? (
        <AnimatedContainer className="flex flex-col gap-6">
          {properties.map((property) => (
            <AnimatedItem key={property.id}>
              <SavedPropertyCard property={property} />
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      ) : (
        <Empty className="min-h-64 border">
          <EmptyHeader>
            <EmptyTitle>No matching saved properties</EmptyTitle>
            <EmptyDescription>
              Adjust or reset your filters to see your shortlist.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </Empty>
      )}

      {filteredProperties.length > PAGE_SIZE && (
        <div className="my-10">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <div className="mt-14">
        <SimilarPropertiesCarousel
          properties={recommendations}
          title="Recommended Properties"
          viewAllHref={
            audience === "buyer" ? "/buyer/properties" : "/properties"
          }
          viewAllLabel="View All Recommendations"
        />
      </div>

      {audience === "buyer" && (
        <div className="mt-16 -mx-6 [&>section]:pb-8">
          <BecomeVendorBanner />
        </div>
      )}
    </>
  );
}

export function BuyerSavedProperties() {
  return <SavedProperties audience="buyer" />;
}

export function VendorSavedProperties() {
  return <SavedProperties audience="vendor" />;
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
