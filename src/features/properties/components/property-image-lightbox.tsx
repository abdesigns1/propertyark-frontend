"use client";

import { useEffect, useState, useCallback, type TouchEvent } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PropertyImageLightboxProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SWIPE_THRESHOLD = 50;

export function PropertyImageLightbox({
  images,
  initialIndex,
  open,
  onOpenChange,
}: PropertyImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <PropertyImageLightboxContent
          images={images}
          initialIndex={initialIndex}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}

interface PropertyImageLightboxContentProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

function PropertyImageLightboxContent({
  images,
  initialIndex,
  onClose,
}: PropertyImageLightboxContentProps) {
  const [index, setIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  function handleTouchStart(e: TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > SWIPE_THRESHOLD) goPrev();
    if (delta < -SWIPE_THRESHOLD) goNext();
    setTouchStartX(null);
  }

  return (
    <DialogContent
      showCloseButton={false}
      className="h-screen max-h-screen w-screen max-w-none border-0 bg-black/95 p-0 sm:rounded-none"
    >
      <DialogTitle className="sr-only">Property image gallery</DialogTitle>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

        <div
          className="relative flex h-full w-full items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-4 z-20 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[75vh] w-full max-w-5xl px-16">
            <Image
              src={images[index]}
              alt={`Property image ${index + 1} of ${images.length}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-4 z-20 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 font-numeric text-xs text-white">
            {index + 1} / {images.length}
          </span>
        </div>

        <div className="absolute bottom-16 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto px-4 pb-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === index
                  ? "border-white"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
    </DialogContent>
  );
}
