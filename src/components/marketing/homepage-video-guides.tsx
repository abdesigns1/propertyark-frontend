"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { YouTubeVideoPlayer } from "@/features/blog/components/youtube-video-player";
import { getLatestVideoGuides } from "@/features/blog/data/video-guides";
import { getYouTubeVideoId } from "@/features/blog/lib/youtube";
import { CONTAINER, cn } from "@/lib/utils";

const LATEST_VIDEO_GUIDES = getLatestVideoGuides(5);

export function HomepageVideoGuides() {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const updateCarouselState = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
    setScrollSnaps(carouselApi.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!api) return;

    const frame = window.requestAnimationFrame(() => updateCarouselState(api));
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      window.cancelAnimationFrame(frame);
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api, updateCarouselState]);

  if (!LATEST_VIDEO_GUIDES.length) return null;

  return (
    <section
      aria-labelledby="homepage-video-guides-heading"
      className="bg-muted/25 py-16 sm:py-20 lg:py-24"
    >
      <div className={CONTAINER}>
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Video className="size-5" aria-hidden="true" />
          </span>
          <h2
            id="homepage-video-guides-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Latest PropertyArk video guides
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Watch the newest PropertyArk walkthroughs and learn how to use the
            platform with confidence.
          </p>
        </div>

        <Carousel
          opts={{ align: "start" }}
          setApi={setApi}
          aria-label="Latest PropertyArk video guides"
        >
          <CarouselContent className="-ml-5">
            {LATEST_VIDEO_GUIDES.map((guide, index) => {
              const videoId = getYouTubeVideoId(guide.youtubeUrl);

              return (
                <CarouselItem
                  key={guide.youtubeUrl}
                  className="pl-5 md:basis-1/2 xl:basis-1/3"
                  aria-label={`${index + 1} of ${LATEST_VIDEO_GUIDES.length}`}
                >
                  <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    {videoId ? (
                      <YouTubeVideoPlayer
                        videoId={videoId}
                        title={guide.title}
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                        <Video className="size-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {scrollSnaps.length > 1 ? (
          <div
            className="mt-7 flex items-center justify-center gap-1"
            aria-label="Select a video guide slide"
          >
            {scrollSnaps.map((_, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to video guide slide ${index + 1}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                className="rounded-full"
              >
                <span
                  className={cn(
                    "h-2 rounded-full bg-primary/20 transition-all",
                    selectedIndex === index ? "w-7 bg-primary" : "w-2",
                  )}
                />
              </Button>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/video-guides">
              View more videos
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
