"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardClock,
  Filter,
  LoaderCircle,
  Mail,
  Megaphone,
  MoreHorizontal,
  Phone,
  Plus,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReviewInspection,
  useVendorInspections,
} from "@/features/vendor/hooks/use-vendor-inspections";
import { useVendorProperties } from "@/features/vendor/hooks/use-vendor-properties";
import { ScheduleInspectionDialog } from "@/features/vendor/components/schedule-inspection-dialog";
import {
  calendarDays,
  calendarEventTone,
  dateKey,
  formatInspectionTime,
  formatMeetingType,
  formatShortDate,
  formatTimelineDate,
  inspectionCode,
  isSameDay,
  monthStart,
  nameInitials,
  nearestInspectionDate,
  normalizeMeetingType,
  parseInspectionDate,
  statTone,
  statusLabel,
} from "@/features/vendor/lib/inspection-display";
import { cn } from "@/lib/utils";
import type {
  VendorInspection,
  VendorInspectionStats,
} from "@/services/inspection.service";

const PAGE_SIZE = 10;

export function VendorInspections() {
  const query = useVendorInspections();
  const propertiesQuery = useVendorProperties();
  const review = useReviewInspection();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [status, setStatus] = useState("all");
  const [propertyId, setPropertyId] = useState("all");
  const [meetingType, setMeetingType] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const inspections = useMemo(
    () => query.data?.inspections ?? [],
    [query.data?.inspections],
  );
  const properties = useMemo(
    () =>
      Array.from(
        new Map(
          inspections.map((inspection) => [
            inspection.propertyId ?? inspection.propertyName,
            inspection.propertyName,
          ]),
        ),
      ),
    [inspections],
  );
  const filtered = useMemo(
    () =>
      inspections.filter(
        (inspection) =>
          (status === "all" || inspection.status === status) &&
          (propertyId === "all" ||
            (inspection.propertyId ?? inspection.propertyName) ===
              propertyId) &&
          (meetingType === "all" ||
            normalizeMeetingType(inspection.meetingType) === meetingType),
      ),
    [inspections, meetingType, propertyId, status],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected =
    inspections.find((inspection) => inspection.id === selectedId) ??
    visible[0] ??
    inspections[0] ??
    null;
  const pending =
    inspections.find((inspection) => inspection.status === "PENDING") ?? null;
  const upcoming =
    [...inspections]
      .filter((inspection) =>
        ["ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(inspection.status),
      )
      .sort(
        (a, b) =>
          new Date(a.inspectionDate).getTime() -
          new Date(b.inspectionDate).getTime(),
      )[0] ?? null;

  if (query.isLoading) return <InspectionsSkeleton />;

  if (query.isError) {
    return (
      <Empty className="min-h-[560px] rounded-xl border">
        <EmptyMedia variant="icon">
          <CalendarX2 />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Inspections could not be loaded</EmptyTitle>
          <EmptyDescription>
            The vendor inspection service is temporarily unavailable.
          </EmptyDescription>
        </EmptyHeader>
        <Button onClick={() => query.refetch()}>Try again</Button>
      </Empty>
    );
  }

  const stats = query.data?.stats ?? {
    upcoming: 0,
    pending: 0,
    completed: 0,
    declined: 0,
  };

  const resetFilters = () => {
    setStatus("all");
    setPropertyId("all");
    setMeetingType("all");
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6 pb-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Property Inspections
          </h1>
          <p className="mt-1 max-w-lg text-base text-muted-foreground">
            Manage user inspection requests and schedule property visits.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="min-w-44"
            onClick={() => setView("calendar")}
          >
            <CalendarDays data-icon="inline-start" /> View Calendar
          </Button>
          <Button
            size="lg"
            className="min-w-48"
            disabled={propertiesQuery.isLoading}
            onClick={() => setScheduleOpen(true)}
          >
            <Plus data-icon="inline-start" /> Schedule Inspection
          </Button>
        </div>
      </header>

      <InspectionStats stats={stats} />

      <div
        className={cn(
          "grid min-w-0 gap-6",
          view === "list" && "xl:grid-cols-[minmax(0,1fr)_290px]",
        )}
      >
        <main className="min-w-0 space-y-4">
          <Card className="gap-3 py-4">
            <CardContent className="flex flex-col gap-3 px-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={view === "list" ? "default" : "ghost"}
                  className="min-w-28"
                  onClick={() => setView("list")}
                >
                  List View
                </Button>
                <Button
                  size="sm"
                  variant={view === "calendar" ? "default" : "ghost"}
                  className="min-w-28"
                  onClick={() => setView("calendar")}
                >
                  Calendar
                </Button>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <FilterSelect
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                  placeholder="Status: All"
                  items={[
                    ["all", "Status: All"],
                    ["PENDING", "Pending"],
                    ["ACCEPTED", "Confirmed"],
                    ["COMPLETED", "Completed"],
                    ["DECLINED", "Declined"],
                    ["CANCELLED", "Cancelled"],
                  ]}
                />
                <FilterSelect
                  value={propertyId}
                  onValueChange={(value) => {
                    setPropertyId(value);
                    setPage(1);
                  }}
                  placeholder="All Properties"
                  className="md:w-56"
                  items={[["all", "All Properties"], ...properties]}
                />
                <FilterSelect
                  value={meetingType}
                  onValueChange={(value) => {
                    setMeetingType(value);
                    setPage(1);
                  }}
                  placeholder="Any Type"
                  items={[
                    ["all", "Any Type"],
                    ["physical", "Physical"],
                    ["virtual", "Virtual"],
                  ]}
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Clear inspection filters"
                  onClick={resetFilters}
                >
                  <Filter />
                </Button>
              </div>
            </CardContent>
          </Card>

          {view === "calendar" ? (
            <InspectionCalendar
              inspections={filtered}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />
          ) : filtered.length ? (
            <InspectionTableCard
              inspections={visible}
              total={filtered.length}
              page={page}
              totalPages={totalPages}
              selectedId={selected?.id}
              onPageChange={setPage}
              onSelect={setSelectedId}
              review={review}
            />
          ) : (
            <Empty className="min-h-[420px] rounded-xl border">
              <EmptyMedia variant="icon">
                <CalendarDays />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No inspections found</EmptyTitle>
                <EmptyDescription>
                  There are no backend inspection requests matching these
                  filters.
                </EmptyDescription>
              </EmptyHeader>
              {(status !== "all" ||
                propertyId !== "all" ||
                meetingType !== "all") && (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              )}
            </Empty>
          )}
        </main>

        {view === "list" && (
          <aside className="min-w-0 space-y-5">
            <Reminders
              upcoming={upcoming}
              pending={pending}
              review={review}
              onSelect={setSelectedId}
            />
            {selected && (
              <InspectionDetails
                inspection={selected}
                onClose={() => setSelectedId(null)}
                review={review}
              />
            )}
          </aside>
        )}
      </div>

      <ScheduleInspectionDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        properties={propertiesQuery.data?.properties ?? []}
        inspections={inspections}
      />
    </div>
  );
}

function InspectionStats({ stats }: { stats: VendorInspectionStats }) {
  const total =
    stats.upcoming + stats.pending + stats.completed + stats.declined;
  const occupancy = total ? Math.round((stats.upcoming / total) * 100) : 0;
  const cards = [
    {
      label: "Upcoming",
      value: stats.upcoming,
      note: "Active",
      icon: CalendarCheck2,
      tone: "blue",
    },
    {
      label: "Pending Requests",
      value: stats.pending,
      note: "Needs Action",
      icon: ClipboardClock,
      tone: "orange",
    },
    {
      label: "Completed",
      value: stats.completed,
      note: "Recorded",
      icon: BadgeCheck,
      tone: "green",
    },
    {
      label: "Cancelled",
      value: stats.declined,
      note: "Closed",
      icon: CalendarX2,
      tone: "red",
    },
    {
      label: "Occupancy Rate",
      value: `${occupancy}%`,
      note: "Accepted share",
      icon: TrendingUp,
      tone: "brown",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <Card key={label} className="gap-5 py-5">
          <CardHeader className="flex-row items-center justify-between px-5">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                statTone(tone),
              )}
            >
              <Icon className="size-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {note}
            </span>
          </CardHeader>
          <CardContent className="px-5">
            <p className="font-numeric text-4xl font-semibold tracking-tight">
              {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InspectionTableCard({
  inspections,
  total,
  page,
  totalPages,
  selectedId,
  onPageChange,
  onSelect,
  review,
}: {
  inspections: VendorInspection[];
  total: number;
  page: number;
  totalPages: number;
  selectedId?: string;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
  review: ReturnType<typeof useReviewInspection>;
}) {
  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <CardContent className="min-w-0 p-0">
        <Table className="min-w-[940px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Inspection ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((inspection) => (
              <TableRow
                key={inspection.id}
                className={cn(
                  "h-[78px] cursor-pointer",
                  selectedId === inspection.id && "bg-surface/80",
                )}
                onClick={() => onSelect(inspection.id)}
              >
                <TableCell className="px-4 font-mono font-semibold text-primary">
                  {inspectionCode(inspection)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      {inspection.userAvatarUrl && (
                        <AvatarImage
                          src={inspection.userAvatarUrl}
                          alt={inspection.userName}
                        />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {nameInitials(inspection.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-28 whitespace-normal font-medium">
                      {inspection.userName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="block max-w-40 whitespace-normal text-muted-foreground">
                    {inspection.propertyName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block whitespace-nowrap">
                    {formatShortDate(inspection.inspectionDate)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatInspectionTime(inspection)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    {normalizeMeetingType(inspection.meetingType) ===
                    "virtual" ? (
                      <Video className="size-4" />
                    ) : (
                      <Building2 className="size-4" />
                    )}
                    {formatMeetingType(inspection.meetingType)}
                  </span>
                </TableCell>
                <TableCell>
                  <InspectionStatus status={inspection.status} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <InspectionActionsMenu
                    inspection={inspection}
                    review={review}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t py-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
          {Math.min(page * PAGE_SIZE, total)} of {total} results
        </p>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardFooter>
    </Card>
  );
}

function Reminders({
  upcoming,
  pending,
  review,
  onSelect,
}: {
  upcoming: VendorInspection | null;
  pending: VendorInspection | null;
  review: ReturnType<typeof useReviewInspection>;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Megaphone className="size-5 text-primary" /> Reminders
      </h2>
      {upcoming ? (
        <Card
          className="cursor-pointer border-primary/20 bg-primary/10"
          onClick={() => onSelect(upcoming.id)}
        >
          <CardHeader>
            <CardDescription className="text-xs font-semibold uppercase text-primary">
              Upcoming inspection
            </CardDescription>
            <CardTitle className="font-mono text-base">
              {inspectionCode(upcoming)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {formatInspectionTime(upcoming)} with {upcoming.userName} at{" "}
            {upcoming.propertyName}.
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0"
              onClick={(event) => {
                event.stopPropagation();
                toast.info(
                  "Inspection alerts require a backend notification endpoint.",
                );
              }}
            >
              Set Alert →
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-5 text-sm text-muted-foreground">
            No upcoming reminders.
          </CardContent>
        </Card>
      )}

      {pending && (
        <Card className="border-secondary/25 bg-secondary/10">
          <CardHeader>
            <CardDescription className="text-xs font-semibold uppercase text-secondary">
              Pending response
            </CardDescription>
            <CardTitle className="text-base">{pending.userName}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Inspection request for {pending.propertyName}.
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              size="sm"
              disabled={review.isPending}
              onClick={() =>
                review.mutate({ inspectionId: pending.id, status: "ACCEPTED" })
              }
            >
              {review.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Check />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={review.isPending}
              onClick={() =>
                review.mutate({
                  inspectionId: pending.id,
                  status: "DECLINED",
                  reason: "Declined by vendor",
                })
              }
            >
              Deny
            </Button>
          </CardFooter>
        </Card>
      )}
    </section>
  );
}

function InspectionActionsMenu({
  inspection,
  review,
}: {
  inspection: VendorInspection;
  review: ReturnType<typeof useReviewInspection>;
}) {
  const pending = inspection.status === "PENDING";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${inspectionCode(inspection)}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!pending || review.isPending}
            onSelect={() =>
              review.mutate({ inspectionId: inspection.id, status: "ACCEPTED" })
            }
          >
            <Check /> Confirm inspection
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!pending || review.isPending}
            onSelect={() =>
              review.mutate({
                inspectionId: inspection.id,
                status: "DECLINED",
                reason: "Declined by vendor",
              })
            }
          >
            <X /> Reject inspection
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={notifyRescheduleUnavailable}>
            <CalendarClock /> Reschedule inspection
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function notifyRescheduleUnavailable() {
  toast.info("Rescheduling is not available yet", {
    description:
      "The backend needs an inspection reschedule endpoint before this date can be changed safely.",
  });
}

function InspectionDetails({
  inspection,
  onClose,
  review,
}: {
  inspection: VendorInspection;
  onClose: () => void;
  review: ReturnType<typeof useReviewInspection>;
}) {
  const pending = inspection.status === "PENDING";

  return (
    <Card className="gap-5">
      <CardHeader className="flex-row items-start justify-between">
        <CardTitle className="text-xl">Inspection Details</CardTitle>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Close details"
          onClick={onClose}
        >
          <X />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6">
        <DetailLabel>Buyer information</DetailLabel>
        <div className="flex items-center gap-3">
          <Avatar>
            {inspection.userAvatarUrl && (
              <AvatarImage
                src={inspection.userAvatarUrl}
                alt={inspection.userName}
              />
            )}
            <AvatarFallback>{nameInitials(inspection.userName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold">{inspection.userName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {inspection.userEmail ?? "PropertyArk user"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            asChild={Boolean(inspection.userEmail)}
            variant="outline"
            size="sm"
            disabled={!inspection.userEmail}
          >
            {inspection.userEmail ? (
              <a href={`mailto:${inspection.userEmail}`}>
                <Mail /> Email
              </a>
            ) : (
              <span>
                <Mail /> Email
              </span>
            )}
          </Button>
          <Button
            asChild={Boolean(inspection.userPhone)}
            variant="outline"
            size="sm"
            disabled={!inspection.userPhone}
          >
            {inspection.userPhone ? (
              <a href={`tel:${inspection.userPhone}`}>
                <Phone /> Call
              </a>
            ) : (
              <span>
                <Phone /> Call
              </span>
            )}
          </Button>
        </div>

        <div>
          <DetailLabel>Property</DetailLabel>
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-surface p-3">
            <Avatar className="size-11 rounded-md">
              {inspection.propertyImageUrl && (
                <AvatarImage
                  className="rounded-md object-cover"
                  src={inspection.propertyImageUrl}
                  alt={inspection.propertyName}
                />
              )}
              <AvatarFallback className="rounded-md bg-background text-primary">
                <Building2 className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {inspection.propertyName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {inspection.location}
              </p>
            </div>
          </div>
        </div>

        <div>
          <DetailLabel>Notes</DetailLabel>
          <div className="mt-2 rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm leading-6">
            {inspection.message ??
              "No notes were provided with this inspection request."}
          </div>
        </div>

        <div>
          <DetailLabel>Timeline</DetailLabel>
          <div className="mt-3 space-y-4 border-l pl-4">
            <TimelineItem
              active
              title={statusLabel(inspection.status)}
              date={formatTimelineDate(
                inspection.updatedAt ?? inspection.inspectionDate,
              )}
            />
            <TimelineItem
              title="Request sent"
              date={formatTimelineDate(inspection.requestSentAt)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 bg-card pt-4">
        {pending && (
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              disabled={review.isPending}
              onClick={() =>
                review.mutate({
                  inspectionId: inspection.id,
                  status: "ACCEPTED",
                })
              }
            >
              {review.isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <Check data-icon="inline-start" />
              )}
              Confirm
            </Button>
            <Button
              variant="destructive"
              disabled={review.isPending}
              onClick={() =>
                review.mutate({
                  inspectionId: inspection.id,
                  status: "DECLINED",
                  reason: "Declined by vendor",
                })
              }
            >
              <X data-icon="inline-start" />
              Reject
            </Button>
          </div>
        )}
        <Button
          className="w-full"
          variant={pending ? "outline" : "default"}
          onClick={notifyRescheduleUnavailable}
        >
          <CalendarClock data-icon="inline-start" />
          Reschedule Inspection
        </Button>
      </CardFooter>
    </Card>
  );
}

function InspectionCalendar({
  inspections,
  selectedId,
  onSelect,
}: {
  inspections: VendorInspection[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthStart(nearestInspectionDate(inspections) ?? new Date()),
  );
  const days = calendarDays(visibleMonth);
  const grouped = useMemo(() => {
    const groups = new Map<string, VendorInspection[]>();
    inspections.forEach((inspection) => {
      const date = parseInspectionDate(inspection.inspectionDate);
      if (!date) return;
      const key = dateKey(date);
      groups.set(key, [...(groups.get(key) ?? []), inspection]);
    });
    return groups;
  }, [inspections]);

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1),
    );
  };

  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-col gap-4 bg-surface/50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CardTitle className="min-w-48 text-2xl">
            {new Intl.DateTimeFormat("en-NG", {
              month: "long",
              year: "numeric",
            }).format(visibleMonth)}
          </CardTitle>
          <div className="flex items-center">
            <Button
              className="rounded-r-none"
              variant="outline"
              size="icon"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              className="rounded-none border-x-0"
              variant="outline"
              onClick={() => setVisibleMonth(monthStart(new Date()))}
            >
              Today
            </Button>
            <Button
              className="rounded-l-none"
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Calendar filters"
          title="The filters above also apply to this calendar"
          onClick={() =>
            toast.info("The filters above are applied to the calendar.")
          }
        >
          <Filter />
        </Button>
      </CardHeader>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 border-y bg-surface/40">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const events = grouped.get(dateKey(day)) ?? [];
              const inMonth = day.getMonth() === visibleMonth.getMonth();
              const today = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-40 border-r border-b p-2.5 last:border-r-0",
                    !inMonth && "bg-surface/30 text-muted-foreground",
                    today &&
                      "bg-primary/5 shadow-[inset_0_3px_0_var(--primary)]",
                  )}
                >
                  <p
                    className={cn(
                      "font-numeric text-base font-medium",
                      today && "text-primary",
                    )}
                  >
                    {day.getDate()}
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {events.slice(0, 3).map((inspection) => (
                      <button
                        key={inspection.id}
                        type="button"
                        className={cn(
                          "w-full rounded-md border-l-4 px-2 py-1.5 text-left text-xs transition-opacity hover:opacity-80",
                          calendarEventTone(inspection.status),
                          selectedId === inspection.id && "ring-2 ring-ring",
                        )}
                        onClick={() => onSelect(inspection.id)}
                      >
                        <span className="block truncate font-semibold">
                          {formatInspectionTime(inspection)} ·{" "}
                          {inspection.userName}
                        </span>
                        <span className="mt-1 block truncate text-[11px] opacity-75">
                          {inspection.propertyName}
                        </span>
                      </button>
                    ))}
                    {events.length > 3 && (
                      <Badge variant="outline">+{events.length - 3} more</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value,
  onValueChange,
  placeholder,
  items,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: string[][];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-full md:w-40", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(([itemValue, label]) => (
            <SelectItem key={itemValue} value={itemValue}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function InspectionStatus({ status }: { status: string }) {
  const destructive = ["DECLINED", "REJECTED", "CANCELLED"].includes(status);
  return (
    <Badge
      variant={
        destructive
          ? "destructive"
          : status === "PENDING"
            ? "outline"
            : "secondary"
      }
      className={cn(
        status === "ACCEPTED" && "bg-primary/10 text-primary",
        status === "COMPLETED" && "bg-success/10 text-success",
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}

function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function TimelineItem({
  title,
  date,
  active = false,
}: {
  title: string;
  date: string;
  active?: boolean;
}) {
  return (
    <div className="relative">
      <span
        className={cn(
          "absolute -left-[21px] top-1 size-2.5 rounded-full bg-muted",
          active && "bg-primary",
        )}
      />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  );
}

function InspectionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <Skeleton className="h-[720px]" />
        <Skeleton className="h-[720px]" />
      </div>
    </div>
  );
}
