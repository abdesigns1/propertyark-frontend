import { Star, MapPin } from "lucide-react";
import { Price } from "@/components/shared/price";
import {
  PURPOSE_LABELS,
  PURPOSE_BADGE_STYLES,
} from "@/features/properties/utils/property-labels";
import type { Property } from "@/features/properties/types";
import { cn } from "@/lib/utils";

export function PropertyHeader({ property }: { property: Property }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {property.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold",
              PURPOSE_BADGE_STYLES[property.purpose],
            )}
          >
            {PURPOSE_LABELS[property.purpose]}
          </span>
          {property.rating && (
            <span className="flex items-center gap-1 text-sm">
              <span className="flex text-secondary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(property.rating!)
                        ? "fill-secondary"
                        : "fill-none text-border",
                    )}
                  />
                ))}
              </span>
              <span className="text-muted-foreground">
                ({property.reviewCount ?? 0} Reviews)
              </span>
            </span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {property.location.address}, {property.location.city}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <Price
          amount={property.price}
          currency={property.currency}
          className="text-xl font-bold text-primary sm:text-2xl"
        />
        {property.purpose === "shortlet" && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">per night</p>
        )}
        {property.purpose !== "shortlet" && property.sizeSqm && (
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-numeric">
              {property.sizeSqm.toLocaleString()}
            </span>
            /Sq Ft
          </p>
        )}
      </div>
    </div>
  );
}
