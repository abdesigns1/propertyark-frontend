"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileBadge } from "lucide-react";
import { PdfDocumentPreview } from "@/features/vendor/components/pdf-document-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";

export function AdminKycDocumentPreview({
  url,
  name,
  ownerName,
  className = "min-h-[540px]",
}: {
  url: string;
  name: string;
  ownerName: string;
  className?: string;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [document, setDocument] = useState<{
    objectUrl: string;
    contentType: string;
  } | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    if (!accessToken) return () => controller.abort();

    void fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = (await response.json().catch(() => null)) as {
            message?: unknown;
          } | null;
          throw new Error(
            typeof error?.message === "string"
              ? `${error.message} (${response.status})`
              : `KYC document request failed (${response.status}).`,
          );
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setFailureMessage(null);
        setDocument({ objectUrl, contentType: blob.type });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setFailureMessage(
            error instanceof Error
              ? error.message
              : "This document could not be securely loaded.",
          );
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [accessToken, url]);

  if (!accessToken || failureMessage) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <FileBadge className="mx-auto size-12" />
          <p className="mt-3">This document could not be securely loaded.</p>
          {failureMessage && <p className="mt-1 text-sm">{failureMessage}</p>}
        </div>
      </div>
    );
  }

  if (!document) return <Skeleton className={`w-full ${className}`} />;

  if (document.contentType === "application/pdf" || /\.pdf$/i.test(name)) {
    return (
      <div className={`w-full overflow-hidden rounded-md border ${className}`}>
        <PdfDocumentPreview
          src={document.objectUrl}
          documentLabel={`Identity document for ${ownerName}`}
          loadingLabel="Rendering identity document…"
          errorDescription="The identity document was loaded, but its PDF pages could not be rendered."
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <Image
        src={document.objectUrl}
        alt={`Submitted identity document for ${ownerName}`}
        fill
        unoptimized
        className="object-contain"
      />
    </div>
  );
}
