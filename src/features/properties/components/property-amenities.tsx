"use client";

import { createElement, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getAmenityIcon } from "@/features/properties/utils/amenity-icons";

const MOBILE_AMENITIES_LIMIT = 10;

export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!amenities.length) return null;

  const initiallyVisibleAmenities = amenities.slice(0, MOBILE_AMENITIES_LIMIT);
  const additionalAmenities = amenities.slice(MOBILE_AMENITIES_LIMIT);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Amenities</h2>
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <ul className="hidden grid-cols-2 gap-x-8 gap-y-4 sm:grid">
          {amenities.map((amenity, index) => (
            <AmenityItem key={`${amenity}-${index}`} amenity={amenity} />
          ))}
        </ul>

        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="sm:hidden"
        >
          <ul className="grid grid-cols-1 gap-4">
            {initiallyVisibleAmenities.map((amenity, index) => (
              <AmenityItem key={`${amenity}-${index}`} amenity={amenity} />
            ))}
          </ul>

          {additionalAmenities.length > 0 && (
            <>
              <CollapsibleContent>
                <ul className="mt-4 grid grid-cols-1 gap-4">
                  {additionalAmenities.map((amenity, index) => (
                    <AmenityItem
                      key={`${amenity}-${index + MOBILE_AMENITIES_LIMIT}`}
                      amenity={amenity}
                    />
                  ))}
                </ul>
              </CollapsibleContent>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full"
                  aria-label={
                    isExpanded
                      ? "Show fewer amenities"
                      : `Show ${additionalAmenities.length} more amenities`
                  }
                >
                  {isExpanded
                    ? "Show less"
                    : `Show more (${additionalAmenities.length})`}
                  <ChevronDown
                    data-icon="inline-end"
                    className={cn(
                      "transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </>
          )}
        </Collapsible>
      </div>
    </section>
  );
}

function AmenityItem({ amenity }: { amenity: string }) {
  return (
    <li className="flex min-w-0 items-center gap-3 text-sm text-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {createElement(getAmenityIcon(amenity), {
          className: "size-4",
          "aria-hidden": true,
        })}
      </span>
      <span className="min-w-0 leading-5">{amenity}</span>
    </li>
  );
}
