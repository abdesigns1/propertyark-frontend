import type { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";
import { Footer } from "@/components/shared/footer";
import { VideoGuidesGallery } from "@/features/blog/components/video-guides-gallery";
import { createPageMetadata } from "@/lib/seo";
import { CONTAINER, cn } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "PropertyArk Video Guides and Tutorials",
  description:
    "Watch PropertyArk video guides for finding properties, creating an account, and listing property in Nigeria.",
  path: "/video-guides",
  image: "/hero image updated.jpg",
});

export default function VideoGuidesPage() {
  return (
    <>
      <PageBanner
        title="PropertyArk Video Guides"
        description="Watch practical guides for using PropertyArk, finding verified listings, and publishing properties in Nigeria."
        imageSrc="/hero image updated.jpg"
        imageAlt="Modern Nigerian property interior"
      />

      <main className={cn(CONTAINER, "py-14 sm:py-16 lg:py-20")}>
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Learn with PropertyArk
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Browse all video guides
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Select any guide to watch it here with the official YouTube player.
          </p>
        </header>

        <VideoGuidesGallery />
      </main>

      <Footer />
    </>
  );
}
