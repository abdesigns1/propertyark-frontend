"use client";

import { useEffect, useState, useCallback, type TouchEvent } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PropertyImageLightboxProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SWIPE_THRESHOLD = 50;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

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
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    setZoom(MIN_ZOOM);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    setZoom(MIN_ZOOM);
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") setZoom(MIN_ZOOM);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, zoomIn, zoomOut]);

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
      className="h-[100dvh] max-h-[100dvh] w-screen max-w-none gap-0 overflow-hidden border-0 bg-black/95 p-0 sm:max-w-none sm:rounded-none"
    >
      <DialogTitle className="sr-only">Property image gallery</DialogTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute right-4 top-4 z-20 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
      >
        <X />
      </Button>

      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 p-1 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={zoomOut}
          disabled={zoom === MIN_ZOOM}
          aria-label="Zoom out"
          className="rounded-full text-white hover:bg-white/15 hover:text-white disabled:text-white/40"
        >
          <ZoomOut />
        </Button>
        <span className="min-w-12 text-center font-numeric text-xs text-white">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={zoomIn}
          disabled={zoom === MAX_ZOOM}
          aria-label="Zoom in"
          className="rounded-full text-white hover:bg-white/15 hover:text-white disabled:text-white/40"
        >
          <ZoomIn />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setZoom(MIN_ZOOM)}
          disabled={zoom === MIN_ZOOM}
          aria-label="Reset zoom"
          className="rounded-full text-white hover:bg-white/15 hover:text-white disabled:text-white/40"
        >
          <RotateCcw />
        </Button>
      </div>

      <div
        className="relative flex h-full min-h-0 w-full items-center justify-center px-2 pb-24 pt-16 sm:px-16 sm:pb-28"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon-lg"
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 z-20 rounded-full bg-black/45 text-white hover:bg-white/20 hover:text-white sm:left-4"
          >
            <ChevronLeft />
          </Button>
        )}

        <div className="relative size-full overflow-hidden">
          <Image
            src={images[index]}
            alt={`Property image ${index + 1} of ${images.length}`}
            fill
            className="object-contain transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoom})` }}
            sizes="100vw"
            priority
          />
        </div>

        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon-lg"
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 z-20 rounded-full bg-black/45 text-white hover:bg-white/20 hover:text-white sm:right-4"
          >
            <ChevronRight />
          </Button>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2">
        <div className="flex max-w-full gap-2 overflow-x-auto rounded-xl bg-black/45 p-2 backdrop-blur-sm">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => {
                setIndex(i);
                setZoom(MIN_ZOOM);
              }}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
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
        <span className="rounded-full bg-black/55 px-3 py-1 font-numeric text-xs text-white backdrop-blur-sm">
          {index + 1} / {images.length}
        </span>
      </div>
    </DialogContent>
  );
}
