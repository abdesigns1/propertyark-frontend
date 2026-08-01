import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SubscriptionPageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function CapacityCard({
  icon: Icon,
  title,
  value,
  label,
  accent = false,
}: {
  icon: LucideIcon;
  title: string;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <Card className="min-h-40">
      <CardHeader>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
            accent && "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <CardAction className="text-sm text-muted-foreground">
          {value}% capacity
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-base font-medium">{label}</p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          aria-label={`${value}% used`}
        >
          <div
            className={cn(
              "h-full rounded-full bg-primary",
              accent && "bg-accent-foreground",
            )}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
