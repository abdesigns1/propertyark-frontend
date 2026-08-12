import {
  ChartNoAxesColumnIncreasing,
  CircleCheckBig,
  ClipboardClock,
  Flag,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUserStats } from "@/services/admin.service";
import { cn } from "@/lib/utils";

interface AdminUserStatsProps {
  stats?: AdminUserStats;
  isLoading: boolean;
}

const statCards = [
  {
    key: "total",
    label: "Total Users",
    description: "Current platform total",
    icon: ChartNoAxesColumnIncreasing,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    key: "verified",
    label: "Verified users",
    description: "List of verified users",
    icon: CircleCheckBig,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    key: "pending",
    label: "Pending users",
    description: "High priority",
    icon: ClipboardClock,
    iconClassName: "bg-secondary/20 text-secondary",
  },
  {
    key: "flagged",
    label: "Flagged Users",
    description: "Users flagged for review",
    icon: Flag,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    key: "active",
    label: "Active",
    description: "Active users on platform",
    icon: UserCheck,
    iconClassName: "bg-primary/10 text-primary",
  },
] as const;

export function AdminUserStatsCards({ stats, isLoading }: AdminUserStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <Skeleton key={card.key} className="h-[205px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <Card key={card.key} className="min-h-[205px] py-0 shadow-sm">
            <CardContent className="flex h-full flex-col p-6">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  card.iconClassName,
                )}
              >
                <Icon className="size-5" />
              </span>
              <p className="mt-5 text-base text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {value.toLocaleString()}
              </p>
              <div className="mt-auto flex min-h-10 items-center border-t pt-4 text-xs text-muted-foreground">
                {card.key === "pending" ? (
                  <div className="flex w-full items-center justify-between gap-3">
                    <Badge
                      variant="secondary"
                      className="h-auto rounded-md px-2 py-1 text-[10px] uppercase leading-3"
                    >
                      Attention required
                    </Badge>
                    <span>{card.description}</span>
                  </div>
                ) : (
                  <span
                    className={cn(
                      card.key === "total" && "font-medium text-primary",
                    )}
                  >
                    {card.description}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
