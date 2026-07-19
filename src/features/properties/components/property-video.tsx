"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface PropertyVideoProps {
  thumbnailSrc: string;
  videoUrl: string;
}

export function PropertyVideo({ thumbnailSrc, videoUrl }: PropertyVideoProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Video</h2>
      <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
        {playing ? (
          <iframe
            src={videoUrl}
            title="Property walkthrough video"
            className="h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block h-full w-full"
            aria-label="Play property walkthrough video"
          >
            <Image
              src={thumbnailSrc}
              alt="Video preview"
              fill
              className="object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                <Play className="ml-1 h-6 w-6 fill-primary" />
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
