import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlogFeaturedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function BlogFeaturedImage({
  src,
  alt,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: BlogFeaturedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}
