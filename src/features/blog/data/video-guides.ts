export interface VideoGuide {
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  duration?: string;
}

/**
 * Add PropertyArk YouTube guides here when their URLs are ready.
 *
 * Example:
 * {
 *   title: "How to list a property on PropertyArk",
 *   description: "A step-by-step guide for vendors publishing a new listing.",
 *   youtubeUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
 *   category: "Vendor guide",
 *   duration: "4:30",
 * },
 */
export const VIDEO_GUIDES: VideoGuide[] = [];
