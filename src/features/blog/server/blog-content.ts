import "server-only";

import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { BlogPost, BlogPostMetadata } from "@/features/blog/types";

const BLOG_DIRECTORY = path.join(process.cwd(), "content", "blog");
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_FEATURED_IMAGE = "/assets/images/propertyark-city-hero.jpg";

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(source: string, fileName: string) {
  const match = source.match(FRONTMATTER_PATTERN);
  if (!match) {
    throw new Error(`Blog article ${fileName} is missing frontmatter.`);
  }

  const values = new Map<string, string>();
  for (const line of match[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0 || line.trim().startsWith("#")) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1));
    if (key) values.set(key, value);
  }

  return { values, content: match[2].trim() };
}

function required(
  values: Map<string, string>,
  field: string,
  fileName: string,
) {
  const value = values.get(field)?.trim();
  if (!value) {
    throw new Error(`Blog article ${fileName} is missing "${field}".`);
  }
  return value;
}

function validateDate(value: string, field: string, fileName: string) {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`Blog article ${fileName} has an invalid "${field}" date.`);
  }
  return value;
}

function validateImageSource(value: string, fileName: string) {
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return value;
  } catch {
    // The error below gives the editor a field-specific message.
  }

  throw new Error(
    `Blog article ${fileName} must use a /public path or an HTTP(S) featured-image URL.`,
  );
}

function readingTime(content: string) {
  const words = content
    .replace(/[`#>*_[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

async function readPost(fileName: string): Promise<BlogPost> {
  const source = await fs.readFile(path.join(BLOG_DIRECTORY, fileName), "utf8");
  const { values, content } = parseFrontmatter(source, fileName);
  const fallbackSlug = fileName.replace(/\.md$/, "");
  const slug = values.get("slug")?.trim() || fallbackSlug;

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `Blog article ${fileName} must use a lowercase, hyphenated slug.`,
    );
  }

  const publishedAt = validateDate(
    required(values, "publishedAt", fileName),
    "publishedAt",
    fileName,
  );
  const updatedAtValue = values.get("updatedAt")?.trim();
  const updatedAt = updatedAtValue
    ? validateDate(updatedAtValue, "updatedAt", fileName)
    : undefined;

  return {
    title: required(values, "title", fileName),
    slug,
    excerpt: required(values, "excerpt", fileName),
    author: required(values, "author", fileName),
    category: required(values, "category", fileName),
    publishedAt,
    updatedAt,
    featuredImage: validateImageSource(
      values.get("featuredImage")?.trim() || DEFAULT_FEATURED_IMAGE,
      fileName,
    ),
    featuredImageAlt:
      values.get("featuredImageAlt")?.trim() ||
      required(values, "title", fileName),
    seoTitle: values.get("seoTitle")?.trim() || undefined,
    seoDescription: values.get("seoDescription")?.trim() || undefined,
    draft: values.get("draft")?.toLowerCase() === "true",
    readingTimeMinutes: readingTime(content),
    content,
  };
}

export const getPublishedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  let files: string[] = [];

  try {
    files = await fs.readdir(BLOG_DIRECTORY);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const posts = await Promise.all(
    files
      .filter(
        (fileName) => fileName.endsWith(".md") && !fileName.startsWith("_"),
      )
      .map(readPost),
  );

  const publishedPosts = posts
    .filter((post) => !post.draft)
    .sort(
      (first, second) =>
        Date.parse(second.publishedAt) - Date.parse(first.publishedAt),
    );

  const slugs = new Set<string>();
  for (const post of publishedPosts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate blog slug detected: ${post.slug}`);
    }
    slugs.add(post.slug);
  }

  return publishedPosts;
});

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await getPublishedBlogPosts();
    return posts.find((post) => post.slug === slug);
  },
);

export function blogPostSummary(post: BlogPost): BlogPostMetadata {
  const { content, ...metadata } = post;
  void content;
  return metadata;
}
