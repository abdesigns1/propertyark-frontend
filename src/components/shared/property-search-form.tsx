"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Sale" },
  { value: "land", label: "Land" },
  { value: "shortlet", label: "Shortlet" },
];

const PRICE_RANGES = [
  { value: "0-500000", label: "₦0 - ₦500K" },
  { value: "500000-2000000", label: "₦500K - ₦2M" },
  { value: "2000000-10000000", label: "₦2M - ₦10M" },
  { value: "10000000-50000000", label: "₦10M - ₦50M" },
  { value: "50000000-100000000", label: "₦50M - ₦100M" },
  { value: "100000000-", label: "₦100M+" },
];

interface PropertySearchFormProps {
  onSearch?: (params: {
    location: string;
    propertyType: string;
    priceRange: string;
  }) => void;
}

export function PropertySearchForm({ onSearch }: PropertySearchFormProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("rent");
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[1].value);

  function handleSearch() {
    onSearch?.({ location, propertyType, priceRange });

    const [minPrice, maxPrice] = priceRange.split("-");
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (propertyType) params.set("type", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:divide-x sm:divide-border">
      <div className="flex-1 px-2 py-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Location
        </label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where are you looking?"
          className="mt-1 border-none p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="px-2 py-1 sm:pl-6">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Property Type
        </label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="mt-1 border-none p-0 shadow-none focus:ring-0 [&>svg]:opacity-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="px-2 py-1 sm:pl-6">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price Range
        </label>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="mt-1 border-none p-0 shadow-none focus:ring-0 [&>svg]:opacity-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-1 sm:pl-6">
        <Button
          onClick={handleSearch}
          className="w-full rounded-md p-6 bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
