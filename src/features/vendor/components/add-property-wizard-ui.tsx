"use client";

import { useRef, type ChangeEvent, type DragEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, FileText, Lightbulb, Trash2, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROPERTY_STEPS } from "@/features/vendor/lib/add-property-form";
import { cn } from "@/lib/utils";

export function PropertyStepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-5" aria-label="Property creation progress">
      {PROPERTY_STEPS.map((label, index) => (
        <li
          key={label}
          className="relative flex flex-col items-center gap-2 text-center"
        >
          {index > 0 && (
            <span
              className={cn(
                "absolute right-1/2 top-5 h-px w-full bg-border",
                index <= current && "bg-primary",
              )}
            />
          )}
          <span
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-4 ring-background",
              index < current && "bg-primary text-primary-foreground",
              index === current &&
                "bg-primary text-primary-foreground ring-primary/20",
            )}
          >
            {index < current ? <Check aria-hidden="true" /> : index + 1}
          </span>
          <span
            className={cn(
              "hidden text-xs font-medium sm:block",
              index === current && "text-primary",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PropertyTipCard({
  title = "Expert Tip",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lightbulb className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="leading-6 text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

export function PropertyUploadBox({
  title,
  description,
  accept,
  multiple = true,
  icon: Icon = UploadCloud,
  onFiles,
}: {
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  icon?: LucideIcon;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const handleFiles = (files: FileList | null) => {
    if (files) onFiles(Array.from(files));
  };

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
      className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center transition-colors hover:bg-primary/10"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-7" />
      </span>
      <span className="text-lg font-semibold">{title}</span>
      <span className="max-w-md text-sm text-muted-foreground">
        {description}
      </span>
      <Badge variant="secondary">Click or drag and drop</Badge>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </button>
  );
}

export function PropertyFileList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove?: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <FileText className="size-5 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
          <Badge variant="outline">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </Badge>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemove(index)}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
