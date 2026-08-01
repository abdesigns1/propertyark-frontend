"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PropertyApiItem } from "@/features/properties/types/api";
import { propertyImage } from "@/features/vendor/lib/vendor-property-display";
import { getDraftMedia } from "@/features/vendor/lib/property-drafts";
import { propertyService } from "@/services/property.service";

interface VendorPropertyThumbnailProps {
  property: PropertyApiItem;
  sizes: string;
  className?: string;
}

/**
 * Loads media lazily when the property-list response omits its media relation.
 * This keeps the main list request fast while ensuring newly uploaded photos
 * appear as soon as the row becomes visible.
 */
export function VendorPropertyThumbnail({
  property,
  sizes,
  className,
}: VendorPropertyThumbnailProps) {
  const isDraft = property.id.startsWith("draft:");
  const draftId = isDraft ? property.id.slice("draft:".length) : "";
  const embeddedMedia = property.media ?? [];
  const backendMedia = useQuery({
    queryKey: ["properties", property.id, "media"],
    queryFn: () => propertyService.getMedia(property.id),
    enabled: !isDraft && embeddedMedia.length === 0,
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const draftMedia = useQuery({
    queryKey: ["property-drafts", draftId, "media"],
    queryFn: () => getDraftMedia(draftId),
    enabled: isDraft,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const draftImageUrl = useMemo(() => {
    const coverPhoto = draftMedia.data?.photos[0];
    return coverPhoto ? URL.createObjectURL(coverPhoto) : null;
  }, [draftMedia.data?.photos]);

  useEffect(
    () => () => {
      if (draftImageUrl) URL.revokeObjectURL(draftImageUrl);
    },
    [draftImageUrl],
  );

  const propertyWithMedia = {
    ...property,
    media: embeddedMedia.length ? embeddedMedia : backendMedia.data,
  };

  return (
    <Image
      src={draftImageUrl ?? propertyImage(propertyWithMedia)}
      alt=""
      fill
      sizes={sizes}
      className={className}
    />
  );
}
