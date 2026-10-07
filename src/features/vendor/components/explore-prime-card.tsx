"use client";

import { Clapperboard, Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PdfDocumentPreview } from "@/features/vendor/components/pdf-document-preview";

const REQUIREMENTS_PDF_URL = "/api/explore-prime-requirements";
const REQUIREMENTS_PDF_NAME = "PropertyArk-Photo-Video-Checklist.pdf";

export function ExplorePrimeCard() {
  return (
    <Card className="bg-primary/5 ring-primary/20">
      <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <CardTitle className="text-lg">Explore Prime</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-relaxed sm:text-base">
              Let PropertyArk help you generate a well-detailed walkthrough
              video of your property.
            </CardDescription>
          </div>
        </div>

        <CardAction className="w-full shrink-0 self-auto justify-self-auto sm:w-auto">
          <RequirementsDialog />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

function RequirementsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <FileText data-icon="inline-start" />
          Click to view the requirements
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[90dvh] max-h-[900px] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-14 sm:px-6">
          <DialogTitle>Explore Prime requirements</DialogTitle>
          <DialogDescription>
            Preview or download the PropertyArk photo and video checklist.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          <PdfDocumentPreview src={REQUIREMENTS_PDF_URL} />
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none px-4 py-3 sm:px-6">
          <Button variant="outline" asChild>
            <a href={REQUIREMENTS_PDF_URL} target="_blank" rel="noreferrer">
              <ExternalLink data-icon="inline-start" />
              Open in new tab
            </a>
          </Button>
          <Button asChild>
            <a href={REQUIREMENTS_PDF_URL} download={REQUIREMENTS_PDF_NAME}>
              <Download data-icon="inline-start" />
              Download PDF
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
