"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Price } from "@/components/shared/price";

import {
  PURPOSE_LABELS,
  PURPOSE_BADGE_STYLES,
  isLandType,
} from "@/features/properties/utils/property-labels";
import type { Property } from "@/features/properties/types";
import { PropertyCardActions } from "@/features/properties/components/property-card-actions";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const {
    id,
    title,
    price,
    currency,
    purpose,
    type,
    location,
    bedrooms,
    bathrooms,
    sizeSqm,
    images,
  } = property;
  const displayedImage =
    images[imageIndex] ?? "/assets/images/hero-property.jpeg";

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          key={displayedImage}
          src={displayedImage}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => {
            if (imageIndex <= images.length - 1) {
              setImageIndex((current) => current + 1);
            }
          }}
        />

        <span
          className={cn(
            "absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold",
            PURPOSE_BADGE_STYLES[purpose],
          )}
        >
          {PURPOSE_LABELS[purpose]}
        </span>

        <PropertyCardActions
          propertyId={id}
          propertyTitle={title}
          className="absolute right-3 top-3"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <Link
          href={`/properties/${id}`}
          className="line-clamp-1 text-base font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          {title}
        </Link>

        <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {location.address}, {location.city}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          {!isLandType(type) && (
            <>
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                <span className="font-numeric">{bedrooms}</span>
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span className="font-numeric">{bathrooms}</span>
              </span>
            </>
          )}
          {typeof sizeSqm === "number" && (
            <span className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span className="font-numeric">
                {sizeSqm.toLocaleString()} {property.sizeUnit ?? "sqm"}
              </span>
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-numeric text-lg font-bold text-primary">
            <Price
              amount={price}
              currency={currency}
              className="text-lg font-bold text-primary"
            />
          </span>
          <Button
            asChild
            size="sm"
            className="rounded-4 p-5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link href={`/properties/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
