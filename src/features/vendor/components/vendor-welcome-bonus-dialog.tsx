"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Gift, Home, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { activeSiteAnnouncement } from "@/config/site-announcement";

interface VendorWelcomeBonusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorWelcomeBonusDialog({
  open,
  onOpenChange,
}: VendorWelcomeBonusDialogProps) {
  if (
    !activeSiteAnnouncement.enabled ||
    !activeSiteAnnouncement.showVendorWelcomeModal
  ) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-5 bg-primary px-6 py-7 text-primary-foreground">
          <div className="flex items-center justify-between gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/15">
              <Gift className="size-6" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeSiteAnnouncement.label}</Badge>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Close welcome message"
                >
                  <X />
                </Button>
              </DialogClose>
            </div>
          </div>

          <DialogHeader>
            <p className="text-sm font-medium text-primary-foreground/80">
              Welcome to PropertyArk
            </p>
            <DialogTitle className="text-2xl leading-tight font-semibold sm:text-3xl">
              Your 1,000 bonus points are ready
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-primary-foreground/85">
              Start posting your properties with the free points added to your
              new vendor account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-4 px-6 py-2">
          <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
            <CalendarDays
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">Bonus period</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use your bonus points to post properties from 1 October to 1
                December 2026.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" asChild>
            <Link
              href="/vendor/credit-points"
              onClick={() => onOpenChange(false)}
            >
              <Gift data-icon="inline-start" />
              View my points
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="/vendor/properties/new"
              onClick={() => onOpenChange(false)}
            >
              <Home data-icon="inline-start" />
              Post a property
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
