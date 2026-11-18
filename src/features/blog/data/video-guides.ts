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
export const VIDEO_GUIDES: VideoGuide[] = [
  {
    title: "How to use PropertyArk",
    description:
      "Watch this PropertyArk platform guide to learn more about using the website and its property services.",
    youtubeUrl: "https://www.youtube.com/watch?v=T1hRJQ0S7tg",
    category: "Platform guide",
  },
  {
    title: "List your property on PropertyArk for free",
    description:
      "Learn how to create a PropertyArk vendor account and start listing your properties on the platform.",
    youtubeUrl: "https://www.youtube.com/watch?v=19ynRbvQsxg",
    category: "Vendor guide",
  },
  {
    title: "How to List a Shortlet Property on PropertyArk",
    description:
      "Do you have a shortlet apartment you want to showcase to potential guests.",
    youtubeUrl: "https://youtu.be/J80BpSRxlQM?si=a5paCGMkazcEYPNc",
    category: "Vendor guide",
  },
];
