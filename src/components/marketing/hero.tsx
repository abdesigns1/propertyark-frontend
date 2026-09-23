"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { getDashboardPath } from "@/features/authentication/utils/dashboard-route";
import { useAuthStore } from "@/store/auth.store";
// import { HeroMarketActivity } from "@/components/marketing/hero-market-activity";

const HERO_VIDEO_URL =
  "https://res.cloudinary.com/wkwqmkrl/video/upload/f_mp4,vc_h264,ac_none,q_auto/v1790183603/VID_20260923_150401_355.mp4";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const investmentHref = isAuthenticated ? getDashboardPath(role) : "/login";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set both properties explicitly because iOS can evaluate autoplay before
    // React finishes applying the muted attribute during hydration.
    video.defaultMuted = true;
    video.muted = true;

    const attemptPlayback = () => {
      if (!document.hidden && video.paused) {
        void video.play().catch(() => {
          // Some mobile settings (notably iOS Low Power Mode) intentionally
          // block autoplay. The poster remains as the visual fallback.
        });
      }
    };

    const handleVisibilityChange = () => attemptPlayback();

    attemptPlayback();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", attemptPlayback);
    document.addEventListener("pointerdown", attemptPlayback, { once: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", attemptPlayback);
      document.removeEventListener("pointerdown", attemptPlayback);
    };
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative isolate overflow-hidden pb-20 pt-28 lg:pb-34">
        {/* Background video + overlay */}
        <div className="absolute inset-0 -z-10">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/assets/images/hero-property.jpg"
            aria-hidden="true"
            disablePictureInPicture
            onCanPlay={(event) => {
              void event.currentTarget.play().catch(() => undefined);
            }}
            className="size-full object-cover"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/48 via-slate-950/25 to-slate-950/52" />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center px-6 lg:px-8">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Buy, Sell &amp; Rent
              <br />
              <span className="text-secondary">Verified</span> Properties
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/85 lg:mx-0">
              Discover a curated selection of premium real estate, backed by
              data and verified for your security. Join thousands of investors
              in the next generation of property management.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button
                asChild
                size="lg"
                className="rounded-2xl bg-primary px-8 py-6 text-primary-foreground hover:bg-primary-hover"
              >
                <Link href="/properties">Browse Properties</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-2xl bg-white px-8 py-6 text-foreground hover:bg-white/90"
              >
                <Link href={investmentHref}>View Investments</Link>
              </Button>
            </div>
          </div>

          {/* Right-side property showcase is temporarily hidden so the search
              form remains visible within the initial viewport.
          <div className="relative">
            <div className="relative h-[340px] overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl sm:h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1707074743640-4cd022c3e58c?q=80&w=889&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Featured luxury property"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="eager"
                className="object-cover"
              />
            </div>

            <HeroMarketActivity />
          </div>
          */}
        </div>
      </section>
    </>
  );
}
