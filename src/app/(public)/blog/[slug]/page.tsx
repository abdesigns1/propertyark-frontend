import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, UserRound } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BlogArticleContent } from "@/features/blog/components/blog-article-content";
import { BlogFeaturedImage } from "@/features/blog/components/blog-featured-image";
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/features/blog/server/blog-content";
import {
  createPageMetadata,
  serializeJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { CONTAINER, cn } from "@/lib/utils";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function absoluteImageUrl(image: string) {
  return new URL(image, SITE_URL).href;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article not found", robots: { index: false } };
  }

  const metadata = createPageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: absoluteImageUrl(post.featuredImage),
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: [absoluteImageUrl(post.featuredImage)],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: articleUrl,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <Navbar />
      <main className={cn(CONTAINER, "pb-16 pt-36 sm:pb-20")}>
        <Button asChild variant="ghost" className="mb-8 px-0">
          <Link href="/blog">
            <ArrowLeft data-icon="inline-start" />
            Back to blog
          </Link>
        </Button>

        <article className="mx-auto max-w-4xl">
          <header className="text-center">
            <Badge variant="secondary">{post.category}</Badge>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
              {post.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-4" aria-hidden="true" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-4" aria-hidden="true" />
                {post.readingTimeMinutes} min read
              </span>
            </div>
          </header>

          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-foreground/10">
            <BlogFeaturedImage
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
            />
          </div>

          <Separator className="my-10" />
          <BlogArticleContent content={post.content} />

          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Ready to explore available properties?</CardTitle>
              <CardDescription>
                Browse verified listings from PropertyArk vendors across
                Nigeria.
              </CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Button asChild>
                <Link href="/properties">Browse properties</Link>
              </Button>
            </CardFooter>
          </Card>
        </article>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </>
  );
}
