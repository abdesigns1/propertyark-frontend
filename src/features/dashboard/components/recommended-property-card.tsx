"use client";

import { PropertyCard } from "@/features/properties/components/property-card";
import type { Property } from "@/features/properties/types";

interface RecommendedPropertyCardProps {
  property: Property;
  index?: number;
}

export function RecommendedPropertyCard({
  property,
}: RecommendedPropertyCardProps) {
  return <PropertyCard property={property} />;
}
