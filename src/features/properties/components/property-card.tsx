"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Images, MapPin, Play, Ruler } from "lucide-react";
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
import { PROPERTY_IMAGE_FALLBACK } from "@/features/properties/utils/normalize-property-response";

interface PropertyCardProps {
  property: Property;
  compactPrice?: boolean;
}

export function PropertyCard({
  property,
  compactPrice = false,
}: PropertyCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [showingWalkthrough, setShowingWalkthrough] = useState(false);
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
    videoUrl,
  } = property;
  const displayedImage = images[imageIndex] ?? PROPERTY_IMAGE_FALLBACK;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {showingWalkthrough && videoUrl ? (
          <video
            src={videoUrl}
            poster={displayedImage}
            className="size-full bg-black object-cover"
            controls
            autoPlay
            playsInline
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <Image
            key={displayedImage}
            src={displayedImage}
            alt={title}
            fill
            crossOrigin="anonymous"
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              if (imageIndex < images.length) {
                setImageIndex((current) => current + 1);
              }
            }}
          />
        )}

        {!showingWalkthrough && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold",
              PURPOSE_BADGE_STYLES[purpose],
            )}
          >
            {PURPOSE_LABELS[purpose]}
          </span>
        )}

        <PropertyCardActions
          propertyId={id}
          propertyTitle={title}
          className="absolute right-3 top-3"
        />

        {videoUrl && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn(
              "absolute left-3 rounded-full shadow-md",
              showingWalkthrough ? "top-3" : "bottom-3",
            )}
            onClick={() => setShowingWalkthrough((current) => !current)}
            aria-pressed={showingWalkthrough}
          >
            {showingWalkthrough ? (
              <Images data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {showingWalkthrough ? "View photos" : "Walkthrough"}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link
          href={`/properties/${id}`}
          className="line-clamp-1 text-base font-semibold text-foreground transition-colors hover:text-primary-hover"
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
          <span
            className={cn(
              "min-w-0 font-numeric font-bold text-primary",
              compactPrice ? "text-base" : "text-lg",
            )}
          >
            <Price
              amount={price}
              currency={currency}
              className={cn(
                "font-bold text-primary",
                compactPrice ? "text-base" : "text-lg",
              )}
            />
          </span>
          <Button
            asChild
            size="sm"
            className="rounded-4 border border-white bg-white p-5 text-primary-hover hover:bg-primary/5 hover:text-primary-hover"
          >
            <Link href={`/properties/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
