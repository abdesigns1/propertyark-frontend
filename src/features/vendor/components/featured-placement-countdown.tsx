"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FeaturedProperty = {
  isFeatured?: boolean;
  featuredUntil?: string | null;
  featureExpiresAt?: string | null;
};

export function FeaturedPlacementCountdown({
  property,
}: {
  property: FeaturedProperty;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!property.isFeatured) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [property.isFeatured]);

  if (!property.isFeatured) {
    return <span className="text-xs text-muted-foreground">Standard</span>;
  }

  const expiry = property.featuredUntil ?? property.featureExpiresAt;
  const remaining = expiry ? new Date(expiry).getTime() - now : null;
  const daysRemaining =
    remaining === null ? null : Math.max(0, Math.ceil(remaining / 86_400_000));
  const expired = remaining !== null && remaining <= 0;
  const endingSoon = daysRemaining !== null && daysRemaining <= 7;

  return (
    <div className="min-w-32 space-y-1.5">
      <Badge
        variant="outline"
        className={cn(
          "gap-1 border-primary/20 bg-primary/10 text-primary",
          expired && "border-destructive/20 bg-destructive/10 text-destructive",
        )}
      >
        <BadgeCheck className="size-3" />
        {expired ? "Expired" : "Featured"}
      </Badge>
      <p
        className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          endingSoon && !expired && "font-medium text-warning",
          expired && "text-destructive",
        )}
      >
        <Clock3 className="size-3" />
        {expired
          ? "Awaiting removal"
          : daysRemaining === null
            ? "Expiry unavailable"
            : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
      </p>
    </div>
  );
}
