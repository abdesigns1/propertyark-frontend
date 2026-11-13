import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
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
import { BlogFeaturedImage } from "@/features/blog/components/blog-featured-image";
import type { BlogPostMetadata } from "@/features/blog/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function BlogPostCard({ post }: { post: BlogPostMetadata }) {
  return (
    <Card className="h-full transition-transform duration-200 hover:-translate-y-1">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden"
        aria-label={`Read ${post.title}`}
      >
        <BlogFeaturedImage
          src={post.featuredImage}
          alt={post.featuredImageAlt}
        />
      </Link>
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {post.category}
        </Badge>
        <CardTitle className="text-xl">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 leading-relaxed">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {formatDate(post.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {post.readingTimeMinutes} min read
        </span>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="px-0">
          <Link href={`/blog/${post.slug}`}>
            Read article
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
