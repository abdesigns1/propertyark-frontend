"use client";

import { useRef, useState, DragEvent } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  isAcceptedKycDocument,
  KYC_DOCUMENT_ACCEPT,
  KYC_DOCUMENT_TYPE_ERROR,
} from "../validation/register.schema";

interface KycUploadFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export function KycUploadField<T extends FieldValues>({
  control,
  name,
}: KycUploadFieldProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const file = field.value as File | undefined;

        function handleFiles(files: FileList | null) {
          const selectedFile = files?.[0];
          if (!selectedFile) return;

          if (!isAcceptedKycDocument(selectedFile)) {
            setSelectionError(KYC_DOCUMENT_TYPE_ERROR);
            field.onChange(undefined);
            if (inputRef.current) inputRef.current.value = "";
            return;
          }

          setSelectionError(null);
          field.onChange(selectedFile);
        }

        const errorMessage = selectionError ?? fieldState.error?.message;

        return (
          <Field>
            <FieldLabel>
              Upload a valid government-issued ID (required for vendors)
            </FieldLabel>
            <div
              onDragOver={(e: DragEvent) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e: DragEvent) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border",
                errorMessage && "border-destructive",
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UploadCloud className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {file ? file.name : "Choose a file or drag & drop it here."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  National ID, Driver&apos;s Licence, or International Passport.
                  JPG, JPEG, and PNG formats, up to 10 MB.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Browse File
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={KYC_DOCUMENT_ACCEPT}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
            {errorMessage && <FieldError>{errorMessage}</FieldError>}
          </Field>
        );
      }}
    />
  );
}
