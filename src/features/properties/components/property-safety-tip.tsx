"use client";

import { useState } from "react";
import { CircleAlert, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PropertyListingPurpose } from "@/features/properties/types";

interface PropertyTip {
  title: string;
  message: string;
}

const GENERAL_TIPS: PropertyTip[] = [
  {
    title: "Verify before you commit",
    message:
      "Confirm the property documents and ownership details with a qualified legal professional before making a payment.",
  },
  {
    title: "Inspect the property",
    message:
      "Arrange a physical inspection and confirm the property condition, access roads, utilities, and surrounding area.",
  },
  {
    title: "Keep payments traceable",
    message:
      "Use a verifiable payment method, confirm the recipient, and collect written receipts for every transaction.",
  },
];

const PURPOSE_TIPS: Partial<Record<PropertyListingPurpose, PropertyTip[]>> = {
  sale: [
    {
      title: "Check the title documents",
      message:
        "Ask a qualified legal professional to verify the title, ownership history, approvals, and any existing encumbrances.",
    },
  ],
  land: [
    {
      title: "Confirm the land boundaries",
      message:
        "Verify the survey coordinates, title documents, permitted land use, and physical boundaries before committing.",
    },
  ],
  rent: [
    {
      title: "Review the rental terms",
      message:
        "Confirm the rent period, service charges, caution fee, renewal terms, and maintenance responsibilities in writing.",
    },
  ],
  shortlet: [
    {
      title: "Confirm your stay details",
      message:
        "Check the dates, house rules, cancellation terms, included amenities, and payment instructions before booking.",
    },
  ],
};

function tipIndex(propertyId: string, count: number) {
  const hash = [...propertyId].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return hash % count;
}

function tipForProperty(propertyId: string, purpose: PropertyListingPurpose) {
  const tips = [...(PURPOSE_TIPS[purpose] ?? []), ...GENERAL_TIPS];
  return tips[tipIndex(propertyId, tips.length)];
}

export function PropertySafetyTip({
  propertyId,
  purpose,
}: {
  propertyId: string;
  purpose: PropertyListingPurpose;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const tip = tipForProperty(propertyId, purpose);

  if (!isVisible) return null;

  return (
    <Card
      role="region"
      aria-live="polite"
      aria-label="Property safety tip"
      className="fixed right-4 bottom-20 z-[60] w-[calc(100vw-2rem)] max-w-sm animate-in gap-4 border-primary/20 bg-background py-5 shadow-xl duration-300 fade-in slide-in-from-bottom-4 sm:right-6"
    >
      <CardHeader className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-lg">{tip.title}</CardTitle>
          <p className="mt-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
            Property tip
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss property tip"
          onClick={() => setIsVisible(false)}
        >
          <X aria-hidden="true" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-5">
        <CardDescription className="flex items-start gap-2 text-sm leading-6 text-foreground/80">
          <CircleAlert
            className="mt-1 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{tip.message}</span>
        </CardDescription>
        <Button
          type="button"
          className="self-end rounded-full px-5"
          onClick={() => setIsVisible(false)}
        >
          I understand
        </Button>
      </CardContent>
    </Card>
  );
}
