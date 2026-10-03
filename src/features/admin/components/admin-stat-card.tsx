import type { ComponentType, ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type AdminStatTone =
  "primary" | "secondary" | "success" | "warning" | "destructive" | "muted";

const toneClasses: Record<AdminStatTone, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export function AdminStatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "primary",
  loading = false,
  action,
  className,
}: {
  label: string;
  value: string | number;
  note?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  tone?: AdminStatTone;
  loading?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("en-NG") : value;

  return (
    <Card
      className={cn(
        "group/stat min-h-44 transition-[transform,box-shadow,ring-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20 motion-reduce:transform-none motion-reduce:transition-none",
        tone === "destructive" && "hover:ring-destructive/25",
        className,
      )}
    >
      <CardHeader className="h-full gap-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover/stat:scale-105 motion-reduce:transform-none",
              toneClasses[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
          {action}
        </div>
        <CardDescription className="min-h-5 text-sm font-semibold text-foreground/75">
          {label}
        </CardDescription>
        <CardTitle className="font-numeric text-3xl font-bold tracking-tight text-foreground">
          {loading ? <Skeleton className="h-9 w-28" /> : displayValue}
        </CardTitle>
        {note && (
          <div className="mt-auto text-xs leading-5 text-muted-foreground">
            {note}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
