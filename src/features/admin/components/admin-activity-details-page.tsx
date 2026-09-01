"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminActivity } from "@/features/admin/hooks/use-admin-activity";
import {
  adminActivityHref,
  formatActivityTime,
} from "@/features/admin/lib/admin-activity-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SENSITIVE_KEY = /token|password|secret|authorization|cookie/i;

export function AdminActivityDetailsPage({
  activityId,
}: {
  activityId: string;
}) {
  const query = useAdminActivity(activityId);
  const activity = query.data;
  const actionHref = activity ? adminActivityHref(activity) : null;
  const metadata = activity
    ? Object.entries(activity.metadata).filter(
        ([key]) => !SENSITIVE_KEY.test(key),
      )
    : [];

  return (
    <AdminWorkspace>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/admin/activity">
            <ArrowLeft data-icon="inline-start" />
            Back to activity log
          </Link>
        </Button>
        {query.isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : query.isError || !activity ? (
          <Card>
            <CardHeader>
              <CardTitle>Activity could not be loaded</CardTitle>
              <CardDescription>
                The activity may no longer exist or the service is unavailable.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-wrap gap-2">
                <Badge>{activity.entityType}</Badge>
                <Badge variant="outline">{activity.action}</Badge>
              </div>
              <CardTitle className="text-2xl">{activity.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock3 className="size-4" />
                {formatActivityTime(activity.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <section>
                <h2 className="font-semibold">Activity details</h2>
                <p className="mt-2 leading-7 text-muted-foreground">
                  {activity.description}
                </p>
              </section>
              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <Detail label="Performed by" value={activity.actor.name} />
                <Detail
                  label="Email"
                  value={activity.actor.email ?? "Not available"}
                />
                <Detail label="Role" value={activity.actor.role ?? "System"} />
                <Detail
                  label="Entity ID"
                  value={activity.entityId ?? "Not available"}
                />
              </div>
              {metadata.length > 0 && (
                <section>
                  <h2 className="font-semibold">Additional information</h2>
                  <dl className="mt-3 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                    {metadata.map(([key, value]) => (
                      <Detail
                        key={key}
                        label={key.replaceAll("_", " ")}
                        value={displayValue(value)}
                      />
                    ))}
                  </dl>
                </section>
              )}
            </CardContent>
            {actionHref && (
              <CardFooter className="justify-end">
                <Button asChild>
                  <Link href={actionHref}>
                    Review and take action
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
      </main>
    </AdminWorkspace>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  );
}

function displayValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return JSON.stringify(value);
}
