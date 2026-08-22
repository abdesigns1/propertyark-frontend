"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminInspections } from "@/features/admin/hooks/use-admin-dashboard";
import {
  inspectionDateLabel,
  inspectionReference,
  inspectionStatusLabel,
  inspectionTimeLabel,
  inspectionTypeLabel,
} from "@/features/admin/lib/admin-inspection-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { VendorInspection } from "@/services/inspection.service";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function AdminInspectionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("ALL");
  const [type, setType] = useState("ALL");
  const query = useAdminInspections(page, PAGE_SIZE);
  const data = query.data;
  const inspections = useMemo(
    () =>
      filterInspections(data?.inspections ?? [], {
        search,
        status,
        date,
        type,
      }),
    [data?.inspections, date, search, status, type],
  );

  function exportReport() {
    const csv = [
      ["Inspection ID", "Property", "Buyer", "Vendor", "Schedule", "Status"],
      ...inspections.map((item) => [
        inspectionReference(item.id),
        item.propertyName,
        item.userName,
        item.vendorName ?? "",
        `${inspectionDateLabel(item.inspectionDate)} ${inspectionTimeLabel(item)}`,
        inspectionStatusLabel(item.status),
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `propertyark-inspections-${page}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Inspection Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Monitor and review property inspections between buyers and
              vendors.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <SlidersHorizontal data-icon="inline-start" /> More Filters
            </Button>
            <Button
              variant="outline"
              onClick={exportReport}
              disabled={!inspections.length}
            >
              <Download data-icon="inline-start" /> Export Report
            </Button>
          </div>
        </header>

        <InspectionStats data={data} loading={query.isLoading} />

        <Card className="mt-10 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search inspection ID, property, buyer or vendor..."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InspectionSelect
                  value={status}
                  onValueChange={setStatus}
                  label="Status"
                  items={[
                    "ALL",
                    "REQUESTED",
                    "SCHEDULED",
                    "COMPLETED",
                    "ISSUE_REPORTED",
                  ]}
                />
                <InspectionSelect
                  value={date}
                  onValueChange={setDate}
                  label="Date"
                  items={["ALL", "TODAY", "WEEK", "MONTH"]}
                />
                <InspectionSelect
                  value={type}
                  onValueChange={setType}
                  label="Property"
                  items={["ALL", "IN_PERSON", "VIDEO_CALL"]}
                />
              </div>
            </div>
            <div className="overflow-x-auto border-t">
              <Table className="min-w-[1050px]">
                <TableHeader className="bg-surface">
                  <TableRow>
                    <TableHead>Inspection ID</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Buyer &amp; Vendor</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.isLoading ? (
                    <LoadingRows />
                  ) : (
                    inspections.map((inspection) => (
                      <InspectionRow
                        key={inspection.id}
                        inspection={inspection}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
              {!query.isLoading && !inspections.length && (
                <div className="flex min-h-56 flex-col items-center justify-center gap-2 p-8 text-center">
                  <CalendarRange className="size-10 text-muted-foreground" />
                  <p className="font-semibold">No inspections found</p>
                  <p className="text-sm text-muted-foreground">
                    Try changing the search or filter selection.
                  </p>
                </div>
              )}
            </div>
            <InspectionPagination
              page={page}
              pages={data?.pagination.pages ?? 1}
              total={data?.pagination.total ?? 0}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </main>
    </AdminWorkspace>
  );
}

function InspectionStats({
  data,
  loading,
}: {
  data: ReturnType<typeof useAdminInspections>["data"];
  loading: boolean;
}) {
  const cards = [
    {
      label: "Total Inspections",
      value: data?.pagination.total ?? 0,
      note: "All requests",
      icon: CalendarDays,
      tone: "primary",
    },
    {
      label: "Pending Requests",
      value: data?.stats.pending ?? 0,
      note: "Awaiting vendor response",
      icon: Clock3,
      tone: "warning",
    },
    {
      label: "Upcoming",
      value: data?.stats.upcoming ?? 0,
      note: "Confirmed and scheduled",
      icon: CalendarRange,
      tone: "primary",
    },
    {
      label: "Completed",
      value: data?.stats.completed ?? 0,
      note: "Successfully completed",
      icon: CheckCircle2,
      tone: "muted",
    },
    {
      label: "Issues Reported",
      value: data?.issuesReported ?? 0,
      note: "Requires admin attention",
      icon: AlertTriangle,
      tone: "destructive",
    },
  ];
  return (
    <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <Card
          key={label}
          className={cn(
            "relative overflow-hidden",
            tone === "destructive" && "border-destructive",
          )}
        >
          {" "}
          <CardContent className="flex min-h-40 flex-col justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
                tone === "warning" && "bg-warning/15 text-warning",
                tone === "destructive" && "bg-destructive/10 text-destructive",
                tone === "muted" && "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  tone === "destructive" && "text-destructive",
                )}
              >
                {label}
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-20" />
              ) : (
                <p
                  className={cn(
                    "mt-1 text-3xl font-semibold",
                    tone === "destructive" && "text-destructive",
                  )}
                >
                  {value.toLocaleString()}
                </p>
              )}
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {note}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function InspectionSelect({
  value,
  onValueChange,
  label,
  items,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  items: string[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {label}:{" "}
              {item === "ALL"
                ? label === "Date"
                  ? "Any Time"
                  : label === "Property"
                    ? "All Types"
                    : "All"
                : item
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function InspectionRow({ inspection }: { inspection: VendorInspection }) {
  const label = inspectionStatusLabel(inspection.status);
  return (
    <TableRow>
      <TableCell className="font-semibold text-primary">
        {inspectionReference(inspection.id)}
      </TableCell>
      <TableCell>
        <div className="flex min-w-48 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            <CalendarDays className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold leading-tight">
              {inspection.propertyName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {inspectionTypeLabel(inspection.meetingType)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span>{inspection.userName}</span>
          <span className="text-muted-foreground">
            {inspection.vendorName ?? "Vendor not provided"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <p>{inspectionDateLabel(inspection.inspectionDate)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {inspectionTimeLabel(inspection)}
        </p>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            label === "Issue Reported"
              ? "destructive"
              : label === "Completed"
                ? "secondary"
                : "outline"
          }
          className={cn(
            label === "Scheduled" &&
              "border-primary/20 bg-primary/10 text-primary",
            label === "Requested" &&
              "border-warning/20 bg-warning/10 text-warning",
          )}
        >
          {label}
        </Badge>
      </TableCell>
      <TableCell>
        {inspection.satisfactionScore
          ? `${inspection.satisfactionScore.toFixed(1)} / 5`
          : label === "Completed"
            ? "Satisfied"
            : "Pending"}
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/admin/inspections/${inspection.id}`}>
            <Eye data-icon="inline-start" /> View Details
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 7 }, (__, cell) => (
            <TableCell key={cell}>
              <Skeleton className="h-8 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function InspectionPagination({
  page,
  pages,
  total,
  onPageChange,
}: {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t bg-surface/50 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0} to{" "}
        {Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()} entries
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Badge className="min-w-9 justify-center">{page}</Badge>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function filterInspections(
  inspections: VendorInspection[],
  filters: { search: string; status: string; date: string; type: string },
) {
  const term = filters.search.trim().toLowerCase();
  const now = Date.now();
  return inspections.filter((item) => {
    const status = inspectionStatusLabel(item.status)
      .toUpperCase()
      .replaceAll(" ", "_");
    const timestamp = new Date(item.inspectionDate).getTime();
    const dateMatches =
      filters.date === "ALL" ||
      (Number.isFinite(timestamp) &&
        (filters.date === "TODAY"
          ? now - timestamp < 86_400_000 && timestamp <= now + 86_400_000
          : filters.date === "WEEK"
            ? Math.abs(now - timestamp) < 604_800_000
            : Math.abs(now - timestamp) < 2_678_400_000));
    return (
      (!term ||
        [item.id, item.propertyName, item.userName, item.vendorName].some(
          (value) => value?.toLowerCase().includes(term),
        )) &&
      (filters.status === "ALL" || status === filters.status) &&
      (filters.type === "ALL" || item.meetingType === filters.type) &&
      dateMatches
    );
  });
}
