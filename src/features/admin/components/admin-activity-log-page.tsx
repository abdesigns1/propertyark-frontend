"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminActivities } from "@/features/admin/hooks/use-admin-activity";
import { formatActivityTime } from "@/features/admin/lib/admin-activity-display";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const entityFilters = [
  { value: "ALL", label: "All activities" },
  { value: "USER", label: "Users" },
  { value: "KYC", label: "KYC & verification" },
  { value: "PROPERTY", label: "Properties" },
  { value: "INSPECTION", label: "Inspections" },
  { value: "BOOKING", label: "Bookings" },
  { value: "PAYMENT", label: "Payments" },
] as const;

export function AdminActivityLogPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("ALL");
  const query = useAdminActivities(page, 20, entityType);
  const data = query.data;

  return (
    <AdminWorkspace>
      <main className="mx-auto flex max-w-[1500px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="secondary">Platform audit trail</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Activity Log
            </h1>
            <p className="mt-1 text-muted-foreground">
              Review user registrations, verification submissions, listings,
              payments, inspections, and bookings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={entityType}
              onValueChange={(value) => {
                setEntityType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {entityFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh activities"
              disabled={query.isFetching}
              onClick={() => query.refetch()}
            >
              <RefreshCw />
            </Button>
          </div>
        </header>

        <Card className="overflow-hidden py-0">
          <CardHeader className="border-b py-5">
            <CardTitle>All platform activities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {query.isLoading ? (
              <div className="flex flex-col gap-3 p-5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton key={item} className="h-16 w-full" />
                ))}
              </div>
            ) : query.isError ? (
              <Empty className="min-h-80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Activity />
                  </EmptyMedia>
                  <EmptyTitle>Activities could not be loaded</EmptyTitle>
                  <EmptyDescription>
                    Please refresh the page or try again shortly.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : data?.activities.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="pr-5 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.activities.map((activity) => {
                    const initials = activity.actor.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("");
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="max-w-md pl-5">
                          <p className="font-semibold">{activity.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{activity.entityType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {initials || "SY"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-40 truncate">
                              {activity.actor.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatActivityTime(activity.createdAt)}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/activity/${activity.id}`}>
                              View
                              <ArrowRight data-icon="inline-end" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Empty className="min-h-80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Activity />
                  </EmptyMedia>
                  <EmptyTitle>No activities found</EmptyTitle>
                  <EmptyDescription>
                    New platform events will appear here automatically.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </AdminWorkspace>
  );
}
