import type { Property } from "@/features/properties/types";

export interface PropertyPriceComparison {
  averagePrice: number;
  comparableCount: number;
  difference: number;
  percentageDifference: number;
  scopeLabel: string;
}

interface ComparisonTier {
  scopeLabel: string;
  matches: (candidate: Property) => boolean;
}

const MINIMUM_COMPARABLES = 2;

function normalized(value: string | undefined) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function sameLocation(first: string | undefined, second: string | undefined) {
  const firstValue = normalized(first);
  return Boolean(firstValue) && firstValue === normalized(second);
}

function sameBedroomCount(property: Property, candidate: Property) {
  return property.bedrooms <= 0 || candidate.bedrooms === property.bedrooms;
}

function rentPeriodMatches(property: Property, candidate: Property) {
  if (property.purpose !== "rent") return true;
  if (!property.rentDuration) return false;
  return candidate.rentDuration === property.rentDuration;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * Finds the narrowest useful group of current public listings for a price
 * comparison. Rent listings are never mixed across monthly/yearly periods.
 */
export function buildPropertyPriceComparison(
  property: Property,
  inventory: Property[],
): PropertyPriceComparison | null {
  if (!Number.isFinite(property.price) || property.price <= 0) return null;
  if (property.purpose === "rent" && !property.rentDuration) return null;

  const cityLabel = [property.location.city, property.location.state]
    .filter(Boolean)
    .join(", ");
  const stateLabel = property.location.state || "Nigeria";
  const baseCandidates = inventory.filter(
    (candidate) =>
      candidate.id !== property.id &&
      candidate.purpose === property.purpose &&
      candidate.currency === property.currency &&
      Number.isFinite(candidate.price) &&
      candidate.price > 0 &&
      rentPeriodMatches(property, candidate),
  );

  const tiers: ComparisonTier[] = [
    {
      scopeLabel: cityLabel,
      matches: (candidate) =>
        sameLocation(candidate.location.city, property.location.city) &&
        candidate.type === property.type &&
        sameBedroomCount(property, candidate),
    },
    {
      scopeLabel: cityLabel,
      matches: (candidate) =>
        sameLocation(candidate.location.city, property.location.city) &&
        candidate.type === property.type,
    },
    {
      scopeLabel: stateLabel,
      matches: (candidate) =>
        sameLocation(candidate.location.state, property.location.state) &&
        candidate.type === property.type &&
        sameBedroomCount(property, candidate),
    },
    {
      scopeLabel: stateLabel,
      matches: (candidate) =>
        sameLocation(candidate.location.state, property.location.state) &&
        candidate.type === property.type,
    },
    {
      scopeLabel: "Nigeria",
      matches: (candidate) =>
        candidate.type === property.type &&
        sameBedroomCount(property, candidate),
    },
    {
      scopeLabel: "Nigeria",
      matches: (candidate) => candidate.type === property.type,
    },
    {
      scopeLabel: "Nigeria",
      matches: () => true,
    },
  ];

  for (const tier of tiers) {
    const comparablePrices = baseCandidates
      .filter(tier.matches)
      .map((candidate) => candidate.price);

    if (comparablePrices.length < MINIMUM_COMPARABLES) continue;

    const averagePrice = average(comparablePrices);
    const difference = property.price - averagePrice;

    return {
      averagePrice,
      comparableCount: comparablePrices.length,
      difference,
      percentageDifference: (difference / averagePrice) * 100,
      scopeLabel: tier.scopeLabel,
    };
  }

  return null;
}
