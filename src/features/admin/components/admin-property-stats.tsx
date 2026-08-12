import { Archive, Building2, CircleCheck, ClipboardClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminPropertyManagementData } from "@/services/admin.service";

export function AdminPropertyStats({
  stats,
  loading,
}: {
  stats?: AdminPropertyManagementData["stats"];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
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
      label: "Rejected/Archived",
      value: stats?.rejectedListings ?? 0,
      icon: Archive,
      note: "Historical moderation records",
      tone: "primary",
    },
  ] as const;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, note, tone }) => (
        <Card key={label} className="min-h-[218px] shadow-sm">
          <CardContent className="flex h-full flex-col p-6">
            <span
              className={
                tone === "secondary"
                  ? "flex size-10 items-center justify-center rounded-lg bg-secondary/15 text-secondary-hover"
                  : "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
              }
            >
              <Icon className="size-5" />
            </span>
            <p className="mt-5 text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-semibold">
              {value.toLocaleString()}
            </p>
            <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">
              {tone === "secondary" ? (
                <div className="flex items-center justify-between gap-3">
                  <Badge className="bg-secondary/15 text-secondary-hover">
                    Attention required
                  </Badge>
                  <span>High priority</span>
                </div>
              ) : (
                note
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
