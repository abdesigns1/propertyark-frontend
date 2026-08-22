"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  MapPin,
  Search,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const PURPOSES = [
  { value: "sale", label: "Sale" },
  { value: "shortlet", label: "Shortlet" },
  { value: "rent", label: "Rent" },
] as const;

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu"];

const PROPERTY_CATEGORIES = [
  { value: "all", label: "All property types" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "mixed-use", label: "Mixed use" },
] as const;

const PRICE_RANGES = [
  { value: "all", label: "Any budget" },
  { value: "0-500000", label: "Up to ₦500K" },
  { value: "500000-2000000", label: "₦500K - ₦2M" },
  { value: "2000000-10000000", label: "₦2M - ₦10M" },
  { value: "10000000-50000000", label: "₦10M - ₦50M" },
  { value: "50000000-100000000", label: "₦50M - ₦100M" },
  { value: "100000000-", label: "₦100M+" },
] as const;

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayAfter(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

export function PropertySearchForm() {
  const router = useRouter();
  const [purpose, setPurpose] = useState("sale");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const today = toDateInputValue(new Date());

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const search = query.trim();
    if (search) params.set("search", search);
    if (purpose) params.set("purpose", purpose);

    if (purpose === "shortlet") {
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      params.set("guests", guests);
    } else {
      if (location !== "all") params.set("location", location);
      if (category !== "all") params.set("category", category);

      if (priceRange !== "all") {
        const [minPrice, maxPrice] = priceRange.split("-");
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
      }
    }

    const pathname = purpose === "shortlet" ? "/shortlets" : "/properties";
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs
      value={purpose}
      onValueChange={setPurpose}
      className="w-full flex-col items-start gap-0"
      orientation="horizontal"
    >
      <TabsList
        variant="line"
        aria-label="Listing purpose"
        className="h-14 shrink-0 justify-start gap-0 rounded-b-none rounded-t-xl bg-card px-2 shadow-sm"
      >
        {PURPOSES.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="h-full min-w-16 px-3 text-sm font-semibold text-muted-foreground sm:min-w-20"
          >
            <span className={cn(purpose === item.value && "text-primary")}>
              {item.label}
            </span>
            {purpose === item.value && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <form
        onSubmit={handleSearch}
        className="w-full rounded-b-2xl rounded-tr-2xl bg-card p-4 shadow-xl ring-1 ring-foreground/5 sm:rounded-tl-none lg:p-3"
      >
        <FieldGroup className="grid gap-0 lg:grid-cols-[1.35fr_0.82fr_0.82fr_0.72fr_auto] lg:items-center">
          {purpose === "shortlet" ? (
            <>
              <Field className="px-4 py-3 lg:border-r">
                <FieldLabel
                  htmlFor="home-shortlet-destination"
                  className="font-semibold"
                >
                  <MapPin aria-hidden="true" className="size-4" />
                  Where
                </FieldLabel>
                <Input
                  id="home-shortlet-destination"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="City, area, or property"
                  className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </Field>

              <Field className="border-t px-4 py-3 lg:border-r lg:border-t-0">
                <FieldLabel
                  htmlFor="home-shortlet-check-in"
                  className="font-semibold"
                >
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Check-in
                </FieldLabel>
                <Input
                  id="home-shortlet-check-in"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(event) => {
                    const nextCheckIn = event.target.value;
                    setCheckIn(nextCheckIn);
                    if (checkOut && checkOut <= nextCheckIn) setCheckOut("");
                  }}
                  className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </Field>

              <Field className="border-t px-4 py-3 lg:border-r lg:border-t-0">
                <FieldLabel
                  htmlFor="home-shortlet-check-out"
                  className="font-semibold"
                >
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Check-out
                </FieldLabel>
                <Input
                  id="home-shortlet-check-out"
                  type="date"
                  min={checkIn ? dayAfter(checkIn) : today}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </Field>

              <Field className="border-t px-4 py-3 lg:border-r lg:border-t-0">
                <FieldLabel
                  htmlFor="home-shortlet-guests"
                  className="font-semibold"
                >
                  <Users aria-hidden="true" className="size-4" />
                  Guests
                </FieldLabel>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger
                    id="home-shortlet-guests"
                    className="h-7 w-full border-0 px-0 shadow-none focus-visible:ring-0"
                  >
                    <SelectValue placeholder="Add guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Array.from({ length: 10 }, (_, index) => {
                        const count = index + 1;
                        return (
                          <SelectItem key={count} value={String(count)}>
                            {count} {count === 1 ? "guest" : "guests"}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </>
          ) : (
            <>
              <Field className="px-4 py-3 lg:border-r">
                <FieldLabel
                  htmlFor="home-property-search"
                  className="font-semibold"
                >
                  <Search aria-hidden="true" className="size-4" />
                  Search
                </FieldLabel>
                <Input
                  id="home-property-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Property, location, or neighbourhood..."
                  className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </Field>

              <Field className="border-t px-4 py-3 lg:border-r lg:border-t-0">
                <FieldLabel
                  htmlFor="home-property-location"
                  className="font-semibold"
                >
                  <MapPin aria-hidden="true" className="size-4" />
                  Location
                </FieldLabel>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger
                    id="home-property-location"
                    className="h-7 w-full border-0 px-0 shadow-none focus-visible:ring-0"
                  >
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Any location</SelectItem>
                      {LOCATIONS.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="border-t px-4 py-3 lg:border-r lg:border-t-0">
                <FieldLabel
                  htmlFor="home-property-type"
                  className="font-semibold"
                >
                  <Building2 aria-hidden="true" className="size-4" />
                  Property Type
                </FieldLabel>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="home-property-type"
                    className="h-7 w-full border-0 px-0 shadow-none focus-visible:ring-0"
                  >
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PROPERTY_CATEGORIES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="border-t px-4 py-3 lg:border-r lg:border-t-0">
                <FieldLabel
                  htmlFor="home-property-budget"
                  className="font-semibold"
                >
                  <WalletCards aria-hidden="true" className="size-4" />
                  Budget
                </FieldLabel>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger
                    id="home-property-budget"
                    className="h-7 w-full border-0 px-0 shadow-none focus-visible:ring-0"
                  >
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          <div className="border-t p-3 lg:border-t-0 lg:px-5">
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full min-w-28 lg:w-auto"
            >
              <Search data-icon="inline-start" />
              {purpose === "shortlet" ? "Search stays" : "Search"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Tabs>
  );
}
