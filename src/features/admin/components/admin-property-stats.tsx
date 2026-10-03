import {
  Archive,
  BadgeCheck,
  Building2,
  CircleCheck,
  ClipboardClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminPropertyManagementData } from "@/services/admin.service";

export function AdminPropertyStats({
  stats,
  loading,
  featuredCount = 0,
}: {
  stats?: AdminPropertyManagementData["stats"];
  loading: boolean;
  featuredCount?: number;
}) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-[218px]" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Listings",
      value: stats?.totalListings ?? 0,
      icon: Building2,
      note: "All platform property listings",
      tone: "primary",
    },
    {
      label: "Pending Review",
      value: stats?.pendingReviews ?? 0,
      icon: ClipboardClock,
      note: "Requires administrator attention",
      tone: "secondary",
    },
    {
      label: "Active Listings",
      value: stats?.activeListings ?? 0,
      icon: CircleCheck,
      note: "Live on marketplace",
      tone: "primary",
    },
    {
      label: "Featured Properties",
      value: featuredCount,
      icon: BadgeCheck,
      note: "Active premium placements",
      tone: "primary",
    },
    {
      label: "Rejected/Archived",
      value: stats?.rejectedListings ?? 0,
      icon: Archive,
      note: "Historical moderation records",
      tone: "primary",
    },
  ] as const;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, note, tone }) => (
        <AdminStatCard
          key={label}
          label={label}
          value={value}
          icon={Icon}
          tone={tone === "secondary" ? "warning" : "primary"}
          note={
            tone === "secondary" ? (
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">Attention required</Badge>
                <span>High priority</span>
              </div>
            ) : (
              note
            )
          }
        />
      ))}
    </div>
  );
}
