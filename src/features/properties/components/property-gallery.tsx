"use client";

import { useState } from "react";
import Image from "next/image";
import { PropertyImageLightbox } from "./property-image-lightbox";

interface PropertyGalleryProps {
  images: string[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full"
        >
          <Image
            src={main}
            alt="Property main view"
            fill
            className="object-cover transition-transform hover:scale-[1.02]"
            priority
          />
        </button>

        {thumbs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {thumbs.map((src, i) => {
              const isLast = i === thumbs.length - 1;
              const showOverlay = isLast && extraCount > 0;
              return (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => openAt(i + 1)}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt={`Property view ${i + 2}`}
                    fill
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
