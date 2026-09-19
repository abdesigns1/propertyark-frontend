"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Price } from "@/components/shared/price";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
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
  const carouselImages = useMemo(() => {
    const uniqueImages = [...new Set(images.filter(Boolean))];
    return uniqueImages.length ? uniqueImages : [PROPERTY_IMAGE_FALLBACK];
  }, [images]);
  useEffect(() => {
    if (!carouselApi) return;
    const updateIndex = () => setImageIndex(carouselApi.selectedScrollSnap());
    const frame = window.requestAnimationFrame(updateIndex);
    carouselApi.on("select", updateIndex);
    carouselApi.on("reInit", updateIndex);
    return () => {
      window.cancelAnimationFrame(frame);
      carouselApi.off("select", updateIndex);
      carouselApi.off("reInit", updateIndex);
    };
  }, [carouselApi]);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: carouselImages.length > 1 }}
          className="size-full"
          aria-label={`${title} property images`}
        >
          <CarouselContent className="ml-0 size-full">
            {carouselImages.map((image, index) => (
              <CarouselItem
                key={`${image}-${index}`}
                className="relative aspect-[4/3] pl-0"
                aria-label={`Image ${index + 1} of ${carouselImages.length}`}
              >
                <PropertyCarouselImage
                  src={image}
                  alt={`${title}, image ${index + 1}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {carouselImages.length > 1 && (
            <>
              <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100" />
              <CarouselNext className="right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100" />
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show property image ${index + 1}`}
                    aria-current={imageIndex === index ? "true" : undefined}
                    className={cn(
                      "size-2 rounded-full border border-white/80 shadow-sm transition-all",
                      imageIndex === index
                        ? "w-5 bg-white"
                        : "bg-white/55 hover:bg-white",
                    )}
                    onClick={() => carouselApi?.scrollTo(index)}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>

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
