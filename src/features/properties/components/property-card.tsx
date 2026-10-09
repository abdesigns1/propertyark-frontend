"use client";

import {
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ruler,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const GLASS_CAROUSEL_BUTTON =
  "border border-white/55 bg-white/30 text-white shadow-lg shadow-black/15 backdrop-blur-md hover:bg-white/45 hover:text-white focus-visible:ring-white/80 disabled:bg-white/20 disabled:text-white/70";
const SWIPE_THRESHOLD_PX = 45;

export function PropertyCard({
  property,
  compactPrice = false,
}: PropertyCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const suppressImageLink = useRef(false);
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
    isFeatured,
  } = property;
  const carouselImages = useMemo(() => {
    const uniqueImages = [...new Set(images.filter(Boolean))];
    return uniqueImages.length ? uniqueImages : [PROPERTY_IMAGE_FALLBACK];
  }, [images]);

  function showPreviousImage() {
    setActiveImageIndex((current) =>
      current === 0 ? carouselImages.length - 1 : current - 1,
    );
  }

  function showNextImage() {
    setActiveImageIndex((current) =>
      current === carouselImages.length - 1 ? 0 : current + 1,
    );
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    suppressImageLink.current = false;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return;
    suppressImageLink.current = true;
    if (distance > 0) showPreviousImage();
    else showNextImage();

    window.setTimeout(() => {
      suppressImageLink.current = false;
    }, 0);
  }

  function handleImageClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!suppressImageLink.current) return;
    event.preventDefault();
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="flex size-full touch-pan-y transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
          aria-live="polite"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {carouselImages.map((image, index) => (
            <Link
              key={`${image}-${index}`}
              href={`/properties/${id}`}
              className="relative block size-full shrink-0"
              aria-label={`View ${title} details from image ${index + 1} of ${carouselImages.length}`}
              onClick={handleImageClick}
            >
              <PropertyCarouselImage
                src={image}
                alt={`${title}, image ${index + 1}`}
              />
            </Link>
          ))}
        </div>

        {carouselImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={showPreviousImage}
              aria-label={`Show previous image of ${title}`}
              className={cn(
                GLASS_CAROUSEL_BUTTON,
                "absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-0 transition-[opacity,background-color] group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
              )}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={showNextImage}
              aria-label={`Show next image of ${title}`}
              className={cn(
                GLASS_CAROUSEL_BUTTON,
                "absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-0 transition-[opacity,background-color] group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
              )}
            >
              <ChevronRight />
            </Button>
          </>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold",
              PURPOSE_BADGE_STYLES[purpose],
            )}
          >
            {PURPOSE_LABELS[purpose]}
          </span>
          {isFeatured && (
            <Badge
              variant="outline"
              className="border-white/60 bg-background/70 text-foreground shadow-sm backdrop-blur-md"
            >
              <BadgeCheck data-icon="inline-start" />
              Featured
            </Badge>
          )}
        </div>

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

function PropertyCarouselImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed ? PROPERTY_IMAGE_FALLBACK : src}
      alt={alt}
      fill
      crossOrigin="anonymous"
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}
