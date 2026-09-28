"use client";

import { useState } from "react";
import Image from "next/image";
import { PropertyImageLightbox } from "./property-image-lightbox";
import { PropertyStreetView } from "./property-street-view";
import { showPropertyImageFallback } from "@/features/properties/utils/normalize-property-response";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  streetViewAddress?: string;
}

export function PropertyGallery({
  images,
  streetViewAddress,
}: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const [main, ...rest] = images;
  const thumbs = rest.slice(0, 4);
  const extraCount = images.length - 5; // total minus main + 4 shown thumbnails

  function openAt(index: number) {
    setStartIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 lg:h-[clamp(22rem,30vw,28rem)] lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full">
          <button
            type="button"
            onClick={() => openAt(0)}
            className="absolute inset-0"
          >
            <Image
              src={main}
              alt="Property main view"
              fill
              sizes="(max-width: 1023px) 100vw, 58vw"
              crossOrigin="anonymous"
              unoptimized
              onError={(event) =>
                showPropertyImageFallback(event.currentTarget)
              }
              className="object-cover transition-transform hover:scale-[1.02]"
              priority
            />
          </button>
          {streetViewAddress && (
            <PropertyStreetView address={streetViewAddress} />
          )}
        </div>

        {thumbs.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-2 gap-3 lg:h-full",
              thumbs.length <= 2 ? "lg:grid-rows-1" : "lg:grid-rows-2",
            )}
          >
            {thumbs.map((src, i) => {
              const isLast = i === thumbs.length - 1;
              const showOverlay = isLast && extraCount > 0;
              return (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => openAt(i + 1)}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full lg:min-h-0"
                >
                  <Image
                    src={src}
                    alt={`Property view ${i + 2}`}
                    fill
                    sizes="(max-width: 1023px) 50vw, 21vw"
                    crossOrigin="anonymous"
                    unoptimized
                    onError={(event) =>
                      showPropertyImageFallback(event.currentTarget)
                    }
                    className="object-cover transition-transform hover:scale-[1.02]"
                  />
                  {showOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                      +{extraCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <PropertyImageLightbox
        images={images}
        initialIndex={startIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
