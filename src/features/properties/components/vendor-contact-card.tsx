import { Phone, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import {
  PURPOSE_LABELS,
  PURPOSE_BADGE_STYLES,
} from "@/features/properties/utils/property-labels";
import type { Property } from "@/features/properties/types";
import { cn } from "@/lib/utils";

export function VendorContactCard({ property }: { property: Property }) {
  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span className="text-secondary">★</span>
        {property.title}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold",
            PURPOSE_BADGE_STYLES[property.purpose],
          )}
        >
          {PURPOSE_LABELS[property.purpose]}
        </span>
        {property.rating && (
          <span className="text-xs text-muted-foreground">
            ★★★★★ ({property.reviewCount} Reviews)
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {property.location.address}, {property.location.city}
      </p>

      <Price
        amount={property.price}
        currency={property.currency}
        className="mt-3 block text-xl font-bold text-primary"
      />

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contact Vendor
      </p>

      <div className="mt-3 rounded-xl bg-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {property.vendorName?.slice(0, 2) ?? "V"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {property.vendorName ?? "Vendor"}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {property.vendorPhone ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg py-5"
          >
            Call Now
          </Button>
          <Button
            size="sm"
            className="flex-1 py-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Send A Message
          </Button>
        </div>
      </div>
    </div>
  );
}
