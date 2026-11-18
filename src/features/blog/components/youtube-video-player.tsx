"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock3, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface YouTubeVideoPlayerProps {
  videoId: string;
  title: string;
  duration?: string;
}

export function YouTubeVideoPlayer({
  videoId,
  title,
  duration,
}: YouTubeVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          className="absolute inset-0 size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`Play ${title}`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={`YouTube thumbnail for ${title}`}
        fill
        sizes="(min-width: 1280px) 384px, (min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform group-hover:scale-110">
          <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
        </span>
      </span>
      {duration ? (
        <Badge className="absolute bottom-3 right-3">
          <Clock3 data-icon="inline-start" />
          {duration}
        </Badge>
      ) : null}
    </button>
  );
}
