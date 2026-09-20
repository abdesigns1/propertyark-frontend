"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileBadge } from "lucide-react";
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
  const [failed, setFailed] = useState(false);

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
        if (!response.ok) throw new Error("KYC document request failed");
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setFailed(false);
        setDocument({ objectUrl, contentType: blob.type });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setFailed(true);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [accessToken, url]);

  if (!accessToken || failed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <FileBadge className="mx-auto size-12" />
          <p className="mt-3">This document could not be securely loaded.</p>
        </div>
      </div>
    );
  }

  if (!document) return <Skeleton className={`w-full ${className}`} />;

  if (document.contentType === "application/pdf" || /\.pdf$/i.test(name)) {
    return (
      <iframe
        src={document.objectUrl}
        title={`Identity document for ${ownerName}`}
        sandbox=""
        referrerPolicy="no-referrer"
        className={`w-full rounded-md border ${className}`}
      />
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
