import { YouTubeVideoPlayer } from "@/features/blog/components/youtube-video-player";
import { getVideoGuidesNewestFirst } from "@/features/blog/data/video-guides";
import { getYouTubeVideoId } from "@/features/blog/lib/youtube";

export function VideoGuidesGallery() {
  const guides = getVideoGuidesNewestFirst();

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {guides.map((guide) => {
        const videoId = getYouTubeVideoId(guide.youtubeUrl);

        if (!videoId) return null;

        return (
          <div
            key={`${guide.youtubeUrl}-${guide.title}`}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <YouTubeVideoPlayer videoId={videoId} title={guide.title} />
          </div>
        );
      })}
    </div>
  );
}
