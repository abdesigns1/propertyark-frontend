"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertyDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <section className="flex max-w-lg flex-col items-center gap-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Property temporarily unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We could not reach the property service. Please try loading this
            listing again in a moment.
          </p>
        </div>
        <Button type="button" onClick={reset}>
          <RotateCw data-icon="inline-start" />
          Try again
        </Button>
      </section>
    </main>
  );
}
