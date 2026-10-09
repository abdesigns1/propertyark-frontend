"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReorderablePropertyPhoto {
  id: string;
  src: string;
  alt: string;
  unoptimized?: boolean;
  isBusy?: boolean;
}

interface ReorderablePropertyPhotoGridProps {
  photos: ReorderablePropertyPhoto[];
  coverLabel?: string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (photo: ReorderablePropertyPhoto, index: number) => void;
}

export function ReorderablePropertyPhotoGrid({
  photos,
  coverLabel,
  onReorder,
  onRemove,
}: ReorderablePropertyPhotoGridProps) {
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);

  function dropAt(toIndex: number) {
    if (!draggedPhotoId) return;
    const fromIndex = photos.findIndex((photo) => photo.id === draggedPhotoId);
    setDraggedPhotoId(null);
    if (fromIndex < 0 || fromIndex === toIndex) return;
    onReorder(fromIndex, toIndex);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo, index) => (
        <figure
          key={photo.id}
          draggable={!photo.isBusy}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            setDraggedPhotoId(photo.id);
          }}
          onDragEnd={() => setDraggedPhotoId(null)}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            dropAt(index);
          }}
          className={cn(
            "group relative aspect-square cursor-grab overflow-hidden rounded-lg border bg-muted active:cursor-grabbing",
            index === 0 && "col-span-2 aspect-video ring-2 ring-primary",
            draggedPhotoId === photo.id && "opacity-50",
          )}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={index === 0 ? "800px" : "400px"}
            unoptimized={photo.unoptimized}
            className="object-cover"
          />

          <div className="absolute left-2 top-2 flex items-center gap-2">
            {index === 0 && coverLabel ? (
              <Badge>{coverLabel}</Badge>
            ) : (
              <Badge variant="secondary">Photo {index + 1}</Badge>
            )}
            <span className="hidden size-7 items-center justify-center rounded-md bg-background/85 text-foreground shadow-sm backdrop-blur-sm sm:flex">
              <GripVertical className="size-4" aria-hidden="true" />
              <span className="sr-only">Drag to reorder</span>
            </span>
          </div>

          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute right-2 top-2"
            disabled={photo.isBusy}
            aria-label={`Remove ${photo.alt}`}
            onClick={() => onRemove(photo, index)}
          >
            {photo.isBusy ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 />
            )}
          </Button>

          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              disabled={index === 0 || photo.isBusy}
              aria-label={`Move ${photo.alt} earlier`}
              onClick={() => onReorder(index, index - 1)}
            >
              <ArrowUp />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              disabled={index === photos.length - 1 || photo.isBusy}
              aria-label={`Move ${photo.alt} later`}
              onClick={() => onReorder(index, index + 1)}
            >
              <ArrowDown />
            </Button>
          </div>
        </figure>
      ))}
    </div>
  );
}
