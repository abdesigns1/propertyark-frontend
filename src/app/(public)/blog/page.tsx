import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { Footer } from "@/components/shared/footer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BlogPostCard } from "@/features/blog/components/blog-post-card";
import { VideoGuidesSection } from "@/features/blog/components/video-guides-section";
import {
  blogPostSummary,
  getPublishedBlogPosts,
} from "@/features/blog/server/blog-content";
import { createPageMetadata } from "@/lib/seo";
import { CONTAINER, cn } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Property Guides and Real Estate Blog",
  description:
    "Read practical Nigerian property guides, market updates, safety advice, and expert insights from PropertyArk.",
  path: "/blog",
  image: "/hero image updated.jpg",
});

export default async function BlogPage() {
  const posts = (await getPublishedBlogPosts()).map(blogPostSummary);

  return (
    <>
      <PageBanner
        title="PropertyArk Blog"
        description="Practical property guidance, market knowledge, and safer ways to discover real estate opportunities across Nigeria."
        imageSrc="/hero image updated.jpg"
        imageAlt="Modern Nigerian property interior"
      />

      <main className={cn(CONTAINER, "py-14 sm:py-16")}>
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Learn with PropertyArk
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Property guides and market insights
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Make better property decisions with useful guides written for
            buyers, renters, investors, and vendors.
          </p>
        </div>

        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyMedia variant="icon">
              <BookOpenText />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Property guides are coming soon</EmptyTitle>
              <EmptyDescription>
                We are preparing practical articles to help you navigate the
                Nigerian property market with confidence.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <VideoGuidesSection />
      </main>

      <Footer />
    </>
  );
}
