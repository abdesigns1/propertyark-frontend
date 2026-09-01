import Link from "next/link";
import { Send, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminNotificationSidebar({
  total,
  unread,
  read,
  critical,
}: {
  total: number;
  unread: number;
  read: number;
  critical: number;
}) {
  return (
    <aside className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">
      <Card className="bg-surface/50">
        <CardHeader>
          <CardTitle className="text-2xl">Alert Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <SummaryMetric label="Total" value={total} tone="neutral" />
          <SummaryMetric label="Unread" value={unread} tone="primary" />
          <SummaryMetric label="Read" value={read} tone="neutral" />
          <SummaryMetric label="Critical" value={critical} tone="critical" />
        </CardContent>
      </Card>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
            <UsersRound className="size-5" aria-hidden />
          </div>
          <CardTitle>Notify your audience</CardTitle>
          <CardDescription>
            Send an in-app or email announcement to all users, vendors, or
            selected recipients.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/admin/settings/notifications">
              <Send data-icon="inline-start" />
              Send notification
            </Link>
          </Button>
        </CardFooter>
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
  tone: "primary" | "critical" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "critical"
          ? "border-destructive/15 bg-destructive/5 text-destructive"
          : tone === "primary"
            ? "border-primary/10 bg-primary/5 text-primary"
            : "bg-muted/40 text-foreground",
      )}
    >
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
