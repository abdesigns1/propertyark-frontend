export interface BlogPostMetadata {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  featuredImageAlt: string;
  seoTitle?: string;
  seoDescription?: string;
  draft: boolean;
  readingTimeMinutes: number;
}

export interface BlogPost extends BlogPostMetadata {
  content: string;
}
