"use client";

import { MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = ["Rent", "Sale", "Land", "Shortlet"] as const;
const CITY_OPTIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
] as const;

const MIN_PRICE = 0;
const MAX_PRICE = 100_000_000;

function formatPrice(value: number) {
  if (value >= 1_000_000) return `₦${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}K`;
  return `₦${value}`;
}

export interface PropertyFilterState {
  types: string[];
  location: string;
  priceRange: [number, number];
}

interface PropertyFiltersProps {
  value: PropertyFilterState;
  onChange?: (filters: PropertyFilterState) => void;
  onReset?: () => void;
  className?: string;
}

export function PropertyFilters({
  value,
  onChange,
  onReset,
  className,
}: PropertyFiltersProps) {
  const { types, location, priceRange } = value;

  function emit(next: Partial<PropertyFilterState>) {
    onChange?.({ types, location, priceRange, ...next });
  }

  function toggleType(type: string) {
    const next = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    emit({ types: next });
  }

  function selectCity(city: string) {
    // Toggle off if the same city is clicked again
    const next = location === city ? "" : city;
    emit({ location: next });
  }

  function handleReset() {
    emit({ types: [], location: "", priceRange: [MIN_PRICE, MAX_PRICE] });
    onReset?.();
  }

  return (
    <aside
      className={cn(
        "h-fit rounded-2xl border border-border bg-card p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          Reset
        </button>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Property Type
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <Checkbox
                checked={types.includes(type)}
                onCheckedChange={() => toggleType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Location
        </p>
        <div className="relative mt-3">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => {
              emit({ location: e.target.value });
            }}
            placeholder="Search city or area"
            className="h-11 pl-9"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Price Range
          </p>
          <span className="font-numeric text-xs font-semibold text-primary">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={(value) => {
            const next = value as [number, number];
            emit({ priceRange: next });
          }}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={1_000_000}
          className="mt-4"
        />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Popular Cities
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CITY_OPTIONS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => selectCity(city)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                location === city
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
