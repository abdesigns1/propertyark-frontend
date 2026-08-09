"use client";

import { useMemo, useRef, useState } from "react";
import {
  Banknote,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  CircleCheck,
  Download,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  useShortletBookings,
  useUpdateShortletBooking,
} from "@/features/vendor/hooks/use-shortlet-bookings";
import type {
  ShortletBooking,
  ShortletBookingStatus,
  ShortletCalendarEvent,
} from "@/services/shortlet-booking.service";
import { getApiErrorMessage } from "@/services/api-error";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function BookingStatusBadge({ status }: { status: ShortletBookingStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize",
        status === "PENDING" && "bg-secondary/15 text-secondary-hover",
        status === "CONFIRMED" && "bg-primary/10 text-primary",
        status === "CHECKED_IN" && "bg-success/10 text-success",
        status === "COMPLETED" && "bg-success/10 text-success",
        status === "CANCELLED" && "bg-destructive/10 text-destructive",
      )}
    >
      {status.toLowerCase()}
    </Badge>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  featured = false,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof CalendarCheck2;
  tone: "primary" | "secondary" | "success" | "muted";
  featured?: boolean;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    muted: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <Card
      className={cn(
        "min-h-44 justify-between py-5 shadow-sm",
        featured && "border-primary/20 bg-primary/10",
      )}
    >
      <CardHeader>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            toneClass,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-numeric mt-1 text-xl font-semibold">{value}</p>
        <p
          className={cn(
            "mt-2 text-sm text-muted-foreground",
            tone === "primary" && "text-primary",
            tone === "secondary" && "text-secondary-hover",
            tone === "success" && "text-success",
          )}
        >
          {note}
        </p>
      </CardContent>
    </Card>
  );
}

function BookingsTable({
  bookings,
  onConfirm,
  onSelect,
  onExport,
  isUpdating,
}: {
  bookings: ShortletBooking[];
  onConfirm: (bookingId: string) => void;
  onSelect: (bookingId: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}) {
  return (
    <Card className="gap-0 py-0 shadow-sm">
      <CardHeader className="min-h-14 border-b py-4">
        <CardTitle>Recent Bookings</CardTitle>
        <CardAction>
          <Button variant="link" onClick={onExport}>
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[820px]">
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length ? (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => onSelect(booking.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(booking.id);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-primary">
                      #{booking.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {booking.guestInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{booking.guestName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-36 whitespace-normal">
                      {booking.propertyName}
                    </TableCell>
                    <TableCell>
                      <p>{dateFormatter.format(new Date(booking.checkIn))}</p>
                      <p className="text-muted-foreground">
                        {booking.nights} nights
                      </p>
                    </TableCell>
                    <TableCell className="font-numeric font-semibold">
                      {currency.format(booking.amount)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Message ${booking.guestName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toast.info(`Opening conversation with ${booking.guestName}.`);
                          }}
                        >
                          <MessageSquareText />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Confirm booking ${booking.id}`}
                          disabled={
                            booking.status !== "PENDING" || isUpdating
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onConfirm(booking.id);
                          }}
                          className="text-primary hover:text-primary"
                        >
                          <Check />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No bookings match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingDetailsSheet({
  booking,
  open,
  onOpenChange,
  onAccept,
  onReject,
  onCheckIn,
  isUpdating,
}: {
  booking: ShortletBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onCheckIn: (bookingId: string) => void;
  isUpdating: boolean;
}) {
  if (!booking) return null;
  const nightlyRate = booking.nights ? booking.amount / booking.nights : 0;
  const pending = booking.status === "PENDING";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[500px]"
      >
        <SheetHeader className="px-6 py-6 sm:px-8">
          <SheetTitle className="text-lg">Booking Details</SheetTitle>
          <SheetDescription>ID: {booking.id}</SheetDescription>
        </SheetHeader>
        <Separator />

        <div className="flex flex-1 flex-col gap-8 px-6 py-7 sm:px-8">
          <section className="flex items-start gap-4">
            <Avatar className="size-20 rounded-xl">
              <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                {booking.guestInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pt-1">
              <p className="font-semibold">{booking.guestName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Guest · {booking.completedStays ?? 0} completed stays
              </p>
              {booking.membership ? (
                <Badge variant="secondary" className="mt-3 text-[10px] uppercase">
                  {booking.membership}
                </Badge>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-surface/50 p-4">
              <p className="text-sm uppercase text-muted-foreground">Check-in</p>
              <p className="mt-2 font-semibold">
                {dateFormatter.format(new Date(booking.checkIn))}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                from {booking.checkInTime ?? "2:00 PM"}
              </p>
            </div>
            <div className="rounded-xl border bg-surface/50 p-4">
              <p className="text-sm uppercase text-muted-foreground">Check-out</p>
              <p className="mt-2 font-semibold">
                {dateFormatter.format(new Date(booking.checkOut))}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                by {booking.checkOutTime ?? "11:00 AM"}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Property &amp; Payment
            </h3>
            <dl className="flex flex-col gap-4">
              <BookingDetailRow label="Property" value={booking.propertyName} />
              <BookingDetailRow label="Rate per night" value={currency.format(nightlyRate)} />
              <BookingDetailRow
                label={`Subtotal (${booking.nights} ${booking.nights === 1 ? "night" : "nights"})`}
                value={currency.format(booking.amount)}
              />
            </dl>
            <Separator />
            <BookingDetailRow
              label="Total Amount"
              value={currency.format(booking.amount)}
              emphasis
            />
          </section>

          <section className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Booking Timeline
            </h3>
            <div className="border-l pl-5">
              <TimelineEntry
                active
                title="Booking Requested"
                detail={formatRequestedAt(booking.requestedAt)}
              />
              <TimelineEntry
                title={
                  booking.status === "PENDING"
                    ? "Waiting for Acceptance"
                    : booking.status === "CANCELLED"
                      ? "Booking Rejected"
                      : booking.status === "CONFIRMED"
                        ? "Booking Confirmed"
                        : booking.status === "CHECKED_IN"
                          ? "Guest Checked In"
                          : "Stay Completed"
                }
                detail={
                  booking.status === "PENDING"
                    ? "Awaiting vendor response"
                    : "Status updated by the booking service"
                }
              />
            </div>
          </section>
        </div>

        <Separator />
        <SheetFooter className="grid grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-2 sm:px-8">
          {pending ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onReject(booking.id)}
                disabled={isUpdating}
              >
                Reject Booking
              </Button>
              <Button
                size="lg"
                onClick={() => onAccept(booking.id)}
                disabled={isUpdating}
              >
                Accept &amp; Confirm
              </Button>
            </>
          ) : booking.status === "CONFIRMED" ? (
            <div className="col-span-full flex items-center justify-between gap-3">
              <BookingStatusBadge status={booking.status} />
              <Button
                size="lg"
                onClick={() => onCheckIn(booking.id)}
                disabled={isUpdating}
              >
                Check In Guest
              </Button>
            </div>
          ) : (
            <div className="col-span-full flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Current status</span>
              <BookingStatusBadge status={booking.status} />
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function BookingDetailRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={cn(emphasis && "font-semibold")}>{label}</dt>
      <dd
        className={cn(
          "max-w-[60%] text-right font-semibold tabular-nums",
          emphasis && "text-primary",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function TimelineEntry({
  title,
  detail,
  active = false,
}: {
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className="relative pb-7 last:pb-0">
      <span
        className={cn(
          "absolute -left-[25px] top-1 size-2.5 rounded-full bg-muted-foreground/20",
          active && "bg-primary",
        )}
      />
      <p className={cn("font-medium", !active && "text-muted-foreground")}>{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function formatRequestedAt(value?: string) {
  if (!value) return "Request time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Request time not available";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

const calendarDays = [
  { day: 29, outside: true },
  { day: 30, outside: true },
  ...Array.from({ length: 12 }, (_, index) => ({
    day: index + 1,
    outside: false,
  })),
];

const calendarToneClasses: Record<ShortletCalendarEvent["tone"], string> = {
  confirmed: "border-primary bg-primary/10 text-primary",
  occupied: "border-destructive bg-destructive/10 text-destructive",
  pending: "border-secondary bg-secondary/15 text-secondary-hover",
  blocked: "border-muted-foreground bg-muted text-muted-foreground",
};

function HospitalityCalendar({ events }: { events: ShortletCalendarEvent[] }) {
  const eventByDay = new Map(events.map((event) => [event.day, event]));

  return (
    <Card id="hospitality-calendar" className="shadow-sm">
      <CardHeader>
        <div>
          <CardTitle>Hospitality Calendar</CardTitle>
          <CardDescription className="mt-1 max-w-52">
            Manage occupancy across all units
          </CardDescription>
        </div>
        <CardAction className="flex flex-wrap justify-end gap-3 text-xs">
          {[
            ["Confirmed", "bg-primary"],
            ["Occupied", "bg-destructive"],
            ["Pending", "bg-secondary"],
            ["Blocked", "bg-muted-foreground"],
          ].map(([label, dot]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", dot)} />
              {label}
            </span>
          ))}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border">
          <div className="grid min-w-[700px] grid-cols-7 bg-surface/70 text-center text-sm font-semibold uppercase text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="border-r px-3 py-4 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid min-w-[700px] grid-cols-7">
            {calendarDays.map(({ day, outside }, index) => {
              const event = outside ? undefined : eventByDay.get(day);
              return (
                <div
                  key={`${day}-${index}`}
                  className="min-h-24 border-r border-t p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0"
                >
                  <p
                    className={cn(
                      "text-right text-sm",
                      outside && "text-muted-foreground",
                    )}
                  >
                    {day}
                  </p>
                  {event ? (
                    <div
                      className={cn(
                        "mt-2 border-l-4 px-2 py-1.5 text-[10px] font-medium leading-tight",
                        calendarToneClasses[event.tone],
                      )}
                    >
                      {event.label}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ShortletBookingManagement() {
  const dashboard = useShortletBookings();
  const updateBooking = useUpdateShortletBooking();
  const calendarRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [propertyId, setPropertyId] = useState("ALL");
  const [availabilityProperty, setAvailabilityProperty] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const bookings = useMemo(
    () => dashboard.data?.bookings ?? [],
    [dashboard.data?.bookings],
  );

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings.filter(
      (booking) =>
        (!term ||
          `${booking.id} ${booking.guestName} ${booking.propertyName}`
            .toLowerCase()
            .includes(term)) &&
        (status === "ALL" || booking.status === status) &&
        (propertyId === "ALL" || booking.propertyId === propertyId),
    );
  }, [bookings, propertyId, search, status]);
  const selectedBooking =
    bookings.find((booking) => booking.id === selectedBookingId) ?? null;

  if (dashboard.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <Card className="mx-auto mt-16 max-w-xl">
        <CardHeader className="items-center text-center">
          <CardTitle>Shortlet bookings unavailable</CardTitle>
          <CardDescription className="max-w-md">
            {getApiErrorMessage(
              dashboard.error,
              "The booking service could not be reached.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button onClick={() => dashboard.refetch()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  const { stats, properties, pricing, calendar, activities } = dashboard.data;
  const selectedPricingProperty =
    properties.find((property) => property.id === pricing.propertyId)?.name ??
    "Selected property";

  function confirmBooking(bookingId: string) {
    updateBooking.mutate({ bookingId, action: "approve" });
  }

  function rejectBooking(bookingId: string) {
    updateBooking.mutate({ bookingId, action: "cancel" });
  }

  function checkInBooking(bookingId: string) {
    updateBooking.mutate({ bookingId, action: "check-in" });
  }

  function exportCsv() {
    const rows = [
      [
        "Booking ID",
        "Guest",
        "Property",
        "Check In",
        "Check Out",
        "Nights",
        "Amount",
        "Status",
      ],
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.guestName,
        booking.propertyName,
        booking.checkIn,
        booking.checkOut,
        booking.nights,
        booking.amount,
        booking.status,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "propertyark-shortlet-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateAvailability(action: "block" | "unblock") {
    if (!availabilityProperty || !fromDate || !toDate) {
      toast.error("Select a property and date range first.");
      return;
    }
    toast.success(
      action === "block"
        ? "Selected dates have been blocked."
        : "Selected dates are now available.",
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7 pb-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Shortlet Booking Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            Overview of your reservations, guest schedules, and property
            availability across Lagos and Abuja.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 min-w-36 text-primary"
            onClick={() =>
              calendarRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <CalendarDays data-icon="inline-start" />
            View Calendar
          </Button>
          <Button
            size="lg"
            className="h-14 min-w-36"
            onClick={() =>
              availabilityRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Plus data-icon="inline-start" />
            Add Availability
          </Button>
        </div>
      </header>

      <section
        aria-label="Shortlet booking summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatCard
          label="Upcoming Bookings"
          value={stats.upcomingBookings.toLocaleString()}
          note={`+${stats.weeklyBookingChange} from last week`}
          icon={CalendarCheck2}
          tone="primary"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests.toLocaleString()}
          note="Requires attention"
          icon={CalendarClock}
          tone="secondary"
        />
        <StatCard
          label="Active Guests"
          value={stats.activeGuests.toLocaleString()}
          note="Currently checked-in"
          icon={UserRoundCheck}
          tone="success"
        />
        <StatCard
          label="Completed"
          value={stats.completedBookings.toLocaleString()}
          note="Lifetime bookings"
          icon={CircleCheck}
          tone="muted"
        />
        <StatCard
          label="Booking Revenue"
          value={compactCurrency.format(stats.revenue)}
          note={`${stats.revenueGrowth}% this month`}
          icon={Banknote}
          tone="primary"
          featured
        />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_314px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="py-4 shadow-sm">
            <CardContent className="grid gap-3 px-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_140px_180px_auto]">
              <InputGroup className="h-11">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search guests..."
                />
              </InputGroup>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-11 justify-start">
                <CalendarDays data-icon="inline-start" />
                May 1 - May 31, 2026
              </Button>
            </CardContent>
          </Card>

          <BookingsTable
            bookings={filteredBookings}
            onConfirm={confirmBooking}
            onSelect={setSelectedBookingId}
            onExport={exportCsv}
            isUpdating={updateBooking.isPending}
          />

          <div ref={calendarRef}>
            <HospitalityCalendar events={calendar} />
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div ref={availabilityRef}>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Property</FieldLabel>
                    <Select
                      value={availabilityProperty}
                      onValueChange={setAvailabilityProperty}
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="availability-from">From</FieldLabel>
                      <Input
                        id="availability-from"
                        type="date"
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="availability-to">To</FieldLabel>
                      <Input
                        id="availability-to"
                        type="date"
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => updateAvailability("block")}
                    >
                      Block Dates
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateAvailability("unblock")}
                    >
                      Unblock
                    </Button>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/25 bg-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Pricing Settings</CardTitle>
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit pricing settings"
                  onClick={() => toast.info("Pricing editor will open here.")}
                >
                  <Pencil />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-background p-3">
                <span className="text-sm text-muted-foreground">
                  Base Weekday Rate
                </span>
                <strong className="font-numeric">
                  {currency.format(pricing.weekdayRate)}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-background p-3">
                <span className="text-sm text-muted-foreground">
                  Weekend Rate
                </span>
                <strong className="font-numeric">
                  {currency.format(pricing.weekendRate)}
                </strong>
              </div>
              <p className="text-sm italic text-muted-foreground">
                Rates apply to {selectedPricingProperty}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Today&apos;s Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "mt-1 size-3 rounded-full border-4",
                          activity.tone === "primary" &&
                            "border-primary/20 bg-primary",
                          activity.tone === "destructive" &&
                            "border-destructive/20 bg-destructive",
                          activity.tone === "success" &&
                            "border-success/20 bg-success",
                        )}
                      />
                      {index < activities.length - 1 ? (
                        <span className="min-h-20 w-px flex-1 bg-border" />
                      ) : null}
                    </div>
                    <div className="pb-6">
                      <p className="text-xs text-muted-foreground">
                        {activity.time} — {activity.type}
                      </p>
                      <p className="mt-1 font-semibold">{activity.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activity.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <BookingDetailsSheet
        booking={selectedBooking}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingId(null);
        }}
        onAccept={confirmBooking}
        onReject={rejectBooking}
        onCheckIn={checkInBooking}
        isUpdating={updateBooking.isPending}
      />
    </div>
  );
}
