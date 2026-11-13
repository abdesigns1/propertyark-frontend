import Image from "next/image";
import Link from "next/link";
import { Clock3, Play, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  VIDEO_GUIDES,
  type VideoGuide,
} from "@/features/blog/data/video-guides";

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");

      const [route, videoId] = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(route)) return videoId ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

function VideoGuideCard({ guide }: { guide: VideoGuide }) {
  const videoId = getYouTubeVideoId(guide.youtubeUrl);

  return (
    <Card className="h-full transition-transform duration-200 hover:-translate-y-1">
      <Link
        href={guide.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-video overflow-hidden bg-muted"
        aria-label={`Watch ${guide.title} on YouTube`}
      >
        {videoId ? (
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={`Video preview for ${guide.title}`}
            fill
            sizes="(min-width: 1280px) 384px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <Video className="size-10" aria-hidden="true" />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/20">
          <span className="flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-6 fill-current" aria-hidden="true" />
          </span>
        </span>
        {guide.duration ? (
          <Badge className="absolute bottom-3 right-3">
            <Clock3 data-icon="inline-start" />
            {guide.duration}
          </Badge>
        ) : null}
      </Link>

      <CardHeader className="flex-1">
        <Badge variant="secondary" className="w-fit">
          {guide.category}
        </Badge>
        <CardTitle className="text-xl">{guide.title}</CardTitle>
        <CardDescription className="line-clamp-3 leading-relaxed">
          {guide.description}
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Button asChild variant="link" className="px-0">
          <Link
            href={guide.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Play data-icon="inline-start" />
            Watch on YouTube
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function VideoGuidesSection() {
  return (
    <section aria-labelledby="video-guides-heading" className="mt-16 sm:mt-20">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Watch and learn
        </p>
        <h2
          id="video-guides-heading"
          className="mt-2 text-3xl font-semibold tracking-tight"
        >
          PropertyArk video guides
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Follow practical walkthroughs for using PropertyArk and learn more
          about finding, listing, and managing properties on the platform.
        </p>
      </div>

      {VIDEO_GUIDES.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {VIDEO_GUIDES.map((guide) => (
            <VideoGuideCard key={guide.youtubeUrl} guide={guide} />
          ))}
        </div>
      ) : (
        <Empty className="border bg-muted/20">
          <EmptyMedia variant="icon">
            <Video />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Video guides are coming soon</EmptyTitle>
            <EmptyDescription>
              PropertyArk walkthroughs and platform tutorials will be added here
              shortly.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  );
}
