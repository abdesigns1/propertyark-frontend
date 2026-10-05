"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function BackgroundVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS can evaluate autoplay before React applies the muted attribute.
    video.defaultMuted = true;
    video.muted = true;

    const attemptPlayback = () => {
      if (!document.hidden && video.paused) {
        void video.play().catch(() => {
          // The poster remains visible when device settings block autoplay.
        });
      }
    };

    attemptPlayback();
    document.addEventListener("visibilitychange", attemptPlayback);
    window.addEventListener("pageshow", attemptPlayback);
    document.addEventListener("pointerdown", attemptPlayback, { once: true });

    return () => {
      document.removeEventListener("visibilitychange", attemptPlayback);
      window.removeEventListener("pageshow", attemptPlayback);
      document.removeEventListener("pointerdown", attemptPlayback);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      disablePictureInPicture
      onCanPlay={(event) => {
        void event.currentTarget.play().catch(() => undefined);
      }}
      className={cn("size-full object-cover", className)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
