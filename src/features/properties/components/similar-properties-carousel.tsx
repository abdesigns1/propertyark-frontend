"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/features/properties/components/property-card";
import type { Property } from "@/features/properties/types";

const AUTO_SCROLL_DELAY = 4_500;

export function SimilarPropertiesCarousel({
  properties,
}: {
  properties: Property[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  function cardScrollDistance() {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return 0;

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function scrollNext() {
    const track = trackRef.current;
    if (!track) return;

    const distance = cardScrollDistance();
    const endReached =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - distance / 2;

    track.scrollTo({
      left: endReached ? 0 : track.scrollLeft + distance,
      behavior: "smooth",
    });
  }

  function scrollPrevious() {
    const track = trackRef.current;
    if (!track) return;

    const distance = cardScrollDistance();
    const startReached = track.scrollLeft <= distance / 2;

    track.scrollTo({
      left: startReached ? track.scrollWidth : track.scrollLeft - distance,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollableState = () => {
      setCanScroll(track.scrollWidth > track.clientWidth + 1);
    };
    const observer = new ResizeObserver(updateScrollableState);
    observer.observe(track);
    updateScrollableState();

    return () => observer.disconnect();
  }, [properties.length]);

  useEffect(() => {
    if (!canScroll || isInteracting) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(scrollNext, AUTO_SCROLL_DELAY);
    return () => window.clearInterval(timer);
  });

  if (!properties.length) return null;

  return (
    <section aria-labelledby="similar-properties-heading">
      <h2
        id="similar-properties-heading"
        className="text-center text-2xl font-semibold text-foreground sm:text-3xl"
      >
        Similar Properties
      </h2>

      <div
        ref={trackRef}
        className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-3 text-left [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Similar property listings"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onFocusCapture={() => setIsInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsInteracting(false);
          }
        }}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
        onPointerCancel={() => setIsInteracting(false)}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-[88%] shrink-0 snap-start sm:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)] xl:w-[calc((100%_-_4.5rem)/4)]"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Button asChild>
          <Link href="/properties">View All Properties</Link>
        </Button>

        <div className="flex items-center gap-3" aria-label="Carousel controls">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="View previous similar property"
            onClick={scrollPrevious}
            disabled={!canScroll}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            size="icon-lg"
            className="rounded-full"
            aria-label="View next similar property"
            onClick={scrollNext}
            disabled={!canScroll}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
