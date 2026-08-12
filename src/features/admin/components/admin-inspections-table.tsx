"use client";

import { useState } from "react";
import { CalendarRange, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatAdminDate } from "@/features/admin/lib/user-display";
import type { VendorInspection } from "@/services/inspection.service";
import { cn } from "@/lib/utils";

export function AdminInspectionsTable({
  inspections,
  loading,
  failed,
  subject,
}: {
  inspections: VendorInspection[];
  loading: boolean;
  failed: boolean;
  subject: "user" | "vendor";
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const visibleInspections = inspections.filter((inspection) =>
    matchesFilter(inspection.status, statusFilter),
  );

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (failed) {
    return (
      <InspectionEmpty
        title="Inspection records could not be loaded"
        description="The inquiries service did not allow this administrator session to retrieve the records."
      />
    );
  }

  return (
    <div className="flex min-h-[460px] flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(value) => value && setStatusFilter(value)}
          size="sm"
          className="h-auto flex-nowrap gap-2 bg-transparent p-0"
        >
          {FILTERS.map((filter) => (
            <ToggleGroupItem
              key={filter.value}
              value={filter.value}
              className={cn(
                "h-8 flex-none rounded-md border bg-background px-3 text-xs shadow-none",
                statusFilter === filter.value &&
                  "border-primary/20 bg-primary/5 font-semibold text-primary",
              )}
            >
              {filter.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarRange className="size-4" />
          {formatRange(inspections)}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>{subject === "vendor" ? "User" : "Vendor"}</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleInspections.map((inspection) => (
              <InspectionRow
                key={inspection.id}
                inspection={inspection}
                subject={subject}
              />
            ))}
          </TableBody>
        </Table>
        {!visibleInspections.length && (
          <InspectionEmpty
            title="No inspection records found"
            description={
              inspections.length
                ? "No inspection record matches the selected status."
                : `The inquiry endpoint returned no inspection requests associated with this ${subject}.`
            }
          />
        )}
      </div>
    </div>
  );
}

const FILTERS = [
  { value: "all", label: "Status: All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

function InspectionRow({
  inspection,
  subject,
}: {
  inspection: VendorInspection;
  subject: "user" | "vendor";
}) {
  const status = inspection.status.toUpperCase();
  return (
    <TableRow>
      <TableCell className="font-medium">{inspection.propertyName}</TableCell>
      <TableCell className="capitalize text-muted-foreground">
        {(inspection.meetingType ?? "Property inspection")
          .toLowerCase()
          .replaceAll("_", " ")}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {inspection.inspectionDate
          ? formatAdminDate(inspection.inspectionDate)
          : "Not scheduled"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {subject === "vendor"
          ? inspection.userName
          : inspection.vendorName || "Not provided"}
      </TableCell>
      <TableCell>
        <InspectionStatus status={status} />
      </TableCell>
    </TableRow>
  );
}

function InspectionStatus({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "PENDING" && "border-warning/20 bg-warning/10 text-warning",
        ["ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(status) &&
          "border-primary/20 bg-primary/10 text-primary",
        status === "COMPLETED" &&
          "border-success/20 bg-success/10 text-success",
        ["DECLINED", "REJECTED", "CANCELLED", "FAILED"].includes(status) &&
          "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      {status.toLowerCase()}
    </Badge>
  );
}

function InspectionEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SearchCheck className="size-5" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function matchesFilter(status: string, filter: string) {
  const normalized = status.toUpperCase();
  if (filter === "all") return true;
  if (filter === "scheduled")
    return ["PENDING", "ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(
      normalized,
    );
  if (filter === "completed") return normalized === "COMPLETED";
  return ["DECLINED", "REJECTED", "CANCELLED", "FAILED"].includes(normalized);
}

function formatRange(inspections: VendorInspection[]) {
  const dates = inspections
    .map((inspection) => new Date(inspection.inspectionDate))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (!dates.length) return "No scheduled date range";
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatter.format(dates[0])} - ${formatter.format(dates.at(-1)!)}`;
}
