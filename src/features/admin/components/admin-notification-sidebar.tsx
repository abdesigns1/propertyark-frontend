import Image from "next/image";
import Link from "next/link";
import { Building2, ClipboardClock, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const healthMetrics = [
  { label: "Platform API", value: "99.9%", icon: Server },
  { label: "Main Database", value: "99.8%", icon: Database },
  { label: "Payment Gateway", value: "100%", icon: Building2 },
] as const;

export function AdminNotificationSidebar({
  unread,
  critical,
  pendingReviews,
}: {
  unread: number;
  critical: number;
  pendingReviews: number;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <Card className="bg-surface/50">
        <CardHeader>
          <CardTitle className="text-2xl">Alert Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <SummaryMetric label="Unread" value={unread} tone="primary" />
          <SummaryMetric label="Critical" value={critical} tone="critical" />
          <div className="col-span-2 flex items-center justify-between rounded-lg border border-secondary/25 bg-secondary/10 p-4">
            <div>
              <p className="text-xs font-semibold text-secondary-hover">
                Pending Reviews
              </p>
              <p className="mt-1 text-3xl font-bold text-secondary-hover">
                {pendingReviews}
              </p>
            </div>
            <ClipboardClock className="size-9 text-secondary-hover" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base uppercase">
            System Health
            <span className="text-xs font-semibold normal-case text-success">
              ● All Systems Optimal
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {healthMetrics.map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <div className="flex items-center gap-2">
                <Icon className="size-5 text-muted-foreground" />
                <span>{label}</span>
                <span className="ml-auto text-xs font-semibold text-success">
                  {value}
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-success" />
              </div>
            </div>
          ))}
          <Button className="mt-2">Full System Metrics</Button>
        </CardContent>
      </Card>

      <Card className="relative min-h-52 justify-end overflow-hidden border-0 text-white">
        <Image
          src="/assets/images/hero-property.jpg"
          alt="Premium PropertyArk market resource"
          fill
          sizes="(min-width: 1280px) 360px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <CardContent className="relative flex flex-col items-start gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide">
            Premium Resource
          </p>
          <p className="max-w-64 text-base leading-6">
            Market Trends 2024 Lagos Real Estate
          </p>
          <Button variant="outline" size="sm" className="mt-1" asChild>
            <Link href="#reports">Download Report</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "critical";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "critical"
          ? "border-destructive/15 bg-destructive/5 text-destructive"
          : "border-primary/10 bg-primary/5 text-primary",
      )}
    >
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
