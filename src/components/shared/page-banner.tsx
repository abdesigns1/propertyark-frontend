import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { BackgroundVideo } from "@/components/shared/background-video";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageBannerProps {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  scrollTargetId?: string;
  showOverlay?: boolean;
  belowContent?: React.ReactNode;
}

export function PageBanner({
  title,
  description,
  imageSrc,
  imageAlt,
  videoSrc,
  scrollTargetId,
  showOverlay = true,
  belowContent,
}: PageBannerProps) {
  return (
    <>
      <Navbar />

      <section
        className={cn(
          "relative isolate overflow-hidden pt-32",
          videoSrc
            ? "flex min-h-[460px] flex-col pb-20 sm:min-h-[520px] sm:pb-24 lg:min-h-[600px]"
            : belowContent
              ? "pb-28"
              : "pb-16",
        )}
      >
        <div className="absolute inset-0 -z-10">
          {videoSrc ? (
            <BackgroundVideo src={videoSrc} poster={imageSrc} />
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          {showOverlay && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/70" />
          )}
        </div>

        <div
          className={cn(
            "mx-auto max-w-7xl px-6",
            videoSrc ? "mt-auto w-full" : "mt-6",
          )}
        >
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
              {description}
            </p>
          )}
        </div>

        {videoSrc && scrollTargetId && (
          <Button
            asChild
            variant="outline"
            size="icon-lg"
            className="absolute right-6 bottom-8 rounded-full border-white/35 bg-white/15 text-white shadow-xl shadow-black/15 backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/25 hover:text-white focus-visible:ring-white/60 motion-safe:animate-bounce sm:right-10 sm:bottom-10 lg:right-[max(2.5rem,calc((100vw-80rem)/2+1.5rem))]"
          >
            <a
              href={`#${scrollTargetId}`}
              aria-label="Scroll to About Us content"
            >
              <ChevronDown />
            </a>
          </Button>
        )}

        {belowContent && (
          <div className="relative z-10 mx-auto mt-10 max-w-7xl translate-y-1/2 px-6">
            {belowContent}
          </div>
        )}
      </section>
    </>
  );
}
