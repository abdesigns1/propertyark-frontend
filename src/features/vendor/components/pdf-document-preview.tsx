"use client";

import { useEffect, useRef, useState } from "react";
import { FileWarning } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

type PreviewState = "loading" | "ready" | "error";

export function PdfDocumentPreview({ src }: { src: string }) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PreviewState>("loading");

  useEffect(() => {
    const pagesContainer = pagesRef.current;
    if (!pagesContainer) return;

    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    const renderTasks: Array<{ cancel: () => void }> = [];

    async function renderDocument(pagesContainer: HTMLDivElement) {
      setState("loading");
      pagesContainer.replaceChildren();

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          "/api/explore-prime-requirements/worker";

        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Unable to load PDF (${response.status})`);
        }

        const data = new Uint8Array(await response.arrayBuffer());
        const task = pdfjs.getDocument({ data });
        loadingTask = task;
        const document = await task.promise;
        if (cancelled) return;

        for (
          let pageNumber = 1;
          pageNumber <= document.numPages;
          pageNumber++
        ) {
          const page = await document.getPage(pageNumber);
          if (cancelled) return;

          const initialViewport = page.getViewport({ scale: 1 });
          const availableWidth = Math.min(
            1200,
            Math.max(320, pagesContainer.clientWidth - 32),
          );
          const cssScale = availableWidth / initialViewport.width;
          const outputScale = Math.min(window.devicePixelRatio || 1, 2);
          const viewport = page.getViewport({ scale: cssScale * outputScale });

          const pageContainer = window.document.createElement("section");
          pageContainer.className =
            "overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-foreground/10";
          pageContainer.setAttribute(
            "aria-label",
            `Checklist page ${pageNumber}`,
          );

          const canvas = window.document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.style.width = `${Math.round(viewport.width / outputScale)}px`;
          canvas.style.height = "auto";
          canvas.className = "block max-w-full bg-background";
          canvas.setAttribute("role", "img");
          canvas.setAttribute(
            "aria-label",
            `Rendered checklist page ${pageNumber} of ${document.numPages}`,
          );
          pageContainer.append(canvas);
          pagesContainer.append(pageContainer);

          const renderTask = page.render({ canvas, viewport });
          renderTasks.push(renderTask);
          await renderTask.promise;
        }

        if (!cancelled) setState("ready");
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Unable to render the Explore Prime PDF preview.",
            error,
          );
          setState("error");
        }
      }
    }

    void renderDocument(pagesContainer);

    return () => {
      cancelled = true;
      renderTasks.forEach((task) => task.cancel());
      void loadingTask?.destroy();
      pagesContainer.replaceChildren();
    };
  }, [src]);

  return (
    <div
      className="relative h-full overflow-y-auto bg-muted p-3 sm:p-5"
      aria-busy={state === "loading"}
    >
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Rendering checklist…
          </div>
        </div>
      )}

      {state === "error" && (
        <Empty className="h-full">
          <EmptyHeader>
            <FileWarning className="size-8 text-muted-foreground" />
            <EmptyTitle>Preview unavailable</EmptyTitle>
            <EmptyDescription>
              Open the checklist in a new tab or download it using the buttons
              below.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div
        ref={pagesRef}
        className="mx-auto flex max-w-6xl flex-col items-center gap-4"
      />
    </div>
  );
}
