import {
  ChartNoAxesColumnIncreasing,
  CircleCheckBig,
  ClipboardClock,
  Flag,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUserStats } from "@/services/admin.service";

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
          <AdminStatCard
            key={card.key}
            label={card.label}
            value={value}
            icon={Icon}
            tone={card.key === "pending" ? "warning" : "primary"}
            note={
              card.key === "pending" ? (
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">Attention required</Badge>
                  <span>{card.description}</span>
                </div>
              ) : (
                card.description
              )
            }
          />
        );
      })}
    </div>
  );
}
