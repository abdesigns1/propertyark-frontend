"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Hotel,
  MapPin,
  RefreshCw,
  UsersRound,
} from "lucide-react";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuyerShortletBookings } from "@/features/dashboard/hooks/use-buyer-shortlet-bookings";
import { getApiErrorMessage } from "@/services/api-error";
import type {
  BuyerShortletBookingsResult,
  ShortletBooking,
  ShortletBookingStatus,
} from "@/services/shortlet-booking.service";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type BookingFilter = "ALL" | ShortletBookingStatus;

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const statusDetails: Record<
  ShortletBookingStatus,
  { label: string; description: string; className: string }
> = {
  PENDING: {
    label: "Awaiting confirmation",
    description: "The vendor is reviewing your booking request.",
    className: "bg-secondary/15 text-secondary-hover",
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "The vendor has accepted and confirmed your stay.",
    className: "bg-primary/10 text-primary",
  },
  CHECKED_IN: {
    label: "Checked in",
    description: "The vendor has checked you into this property.",
    className: "bg-success/10 text-success",
  },
  COMPLETED: {
    label: "Completed",
    description: "This shortlet stay has been completed.",
    className: "bg-success/10 text-success",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "This booking is no longer active.",
    className: "bg-destructive/10 text-destructive",
  },
};

const filters: Array<{ value: BookingFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CHECKED_IN", label: "Checked in" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : dateFormatter.format(date);
}

function BookingStatusBadge({ status }: { status: ShortletBookingStatus }) {
  const details = statusDetails[status];

  return (
    <Badge variant="secondary" className={details.className}>
      {details.label}
    </Badge>
  );
}

function BookingProgress({ status }: { status: ShortletBookingStatus }) {
  const stages = ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED"] as const;
  const activeIndex = stages.indexOf(status as (typeof stages)[number]);

  if (status === "CANCELLED") {
    return (
      <p className="text-sm text-destructive">
        This booking was cancelled or declined.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1" aria-label="Booking progress">
      {stages.map((stage, index) => {
        const complete = index <= activeIndex;
        return (
          <div key={stage} className="min-w-0">
            <div
              className={cn(
                "mb-2 h-1.5 rounded-full bg-muted",
                complete && "bg-primary",
                status === "COMPLETED" && complete && "bg-success",
              )}
            />
            <p
              className={cn(
                "truncate text-xs text-muted-foreground",
                complete && "font-medium text-foreground",
              )}
            >
              {statusDetails[stage].label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BookingCard({ booking }: { booking: ShortletBooking }) {
  const details = statusDetails[booking.status];
  const guests = (booking.adults ?? 0) + (booking.children ?? 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">{booking.propertyName}</CardTitle>
        <CardDescription>
          Booking #{booking.id.slice(-8).toUpperCase()}
        </CardDescription>
        <CardAction>
          <BookingStatusBadge status={booking.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{details.description}</p>

        <BookingProgress status={booking.status} />

        <div className="grid gap-4 border-y py-4 sm:grid-cols-2 lg:grid-cols-4">
          <BookingFact
            icon={CalendarCheck2}
            label="Check-in"
            value={formatDate(booking.checkIn)}
          />
          <BookingFact
            icon={CalendarClock}
            label="Check-out"
            value={formatDate(booking.checkOut)}
          />
          <BookingFact
            icon={Hotel}
            label="Duration"
            value={`${booking.nights} ${booking.nights === 1 ? "night" : "nights"}`}
          />
          <BookingFact
            icon={UsersRound}
            label="Guests"
            value={
              guests
                ? `${guests} ${guests === 1 ? "guest" : "guests"}`
                : "Not specified"
            }
          />
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            {booking.propertyLocation ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <span>{booking.propertyLocation}</span>
              </p>
            ) : null}
            <p className="font-numeric text-lg font-semibold">
              {currencyFormatter.format(booking.amount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {booking.propertyId !== "unknown-property" ? (
              <Button variant="outline" asChild>
                <Link href={`/shortlets/${booking.propertyId}`}>
                  View property
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function BookingSummary({ data }: { data: BuyerShortletBookingsResult }) {
  const summary = [
    {
      label: "Total bookings",
      value: data.stats.total,
      note: "All booking requests",
      icon: Hotel,
    },
    {
      label: "Awaiting vendor",
      value: data.stats.pending,
      note: "Pending confirmation",
      icon: CalendarClock,
    },
    {
      label: "Upcoming stays",
      value: data.stats.confirmed,
      note: "Vendor confirmed",
      icon: CalendarCheck2,
    },
    {
      label: "Checked in",
      value: data.stats.checkedIn,
      note: "Currently staying",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summary.map(({ label, value, note, icon: Icon }) => (
        <Card key={label} size="sm" className="shadow-sm">
          <CardHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <CardAction className="font-numeric text-2xl font-semibold">
              {value}
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading shortlet bookings">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 2 }, (_, index) => (
        <Skeleton key={index} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

export function BuyerShortletBookings() {
  const query = useBuyerShortletBookings();
  const [filter, setFilter] = useState<BookingFilter>("ALL");
  const bookings = useMemo(() => {
    const allBookings = query.data?.bookings ?? [];
    return filter === "ALL"
      ? allBookings
      : allBookings.filter((booking) => booking.status === filter);
  }, [filter, query.data?.bookings]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Shortlet Bookings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track vendor confirmation, check-in, and your complete stay history.
          </p>
        </div>
        <Button asChild>
          <Link href="/shortlets">Find a shortlet</Link>
        </Button>
      </div>

      {query.isLoading ? <BookingsSkeleton /> : null}

      {query.isError ? (
        <Empty className="min-h-80 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RefreshCw aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Bookings could not be loaded</EmptyTitle>
            <EmptyDescription>
              {getApiErrorMessage(
                query.error,
                "Your booking history is temporarily unavailable.",
              )}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => query.refetch()} disabled={query.isFetching}>
              <RefreshCw
                data-icon="inline-start"
                className={cn(query.isFetching && "animate-spin")}
              />
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      ) : null}

      {query.data ? (
        <>
          <BookingSummary data={query.data} />

          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as BookingFilter)}
          >
            <div className="overflow-x-auto pb-1">
              <TabsList aria-label="Filter shortlet bookings">
                {filters.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {bookings.length ? (
            <div className="grid gap-5 2xl:grid-cols-2">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Empty className="min-h-80 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleDot aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  {filter === "ALL"
                    ? "No shortlet bookings yet"
                    : `No ${statusDetails[filter].label.toLowerCase()} bookings`}
                </EmptyTitle>
                <EmptyDescription>
                  {filter === "ALL"
                    ? "When you request a shortlet, its confirmation and check-in progress will appear here."
                    : "Choose another status to view the rest of your booking history."}
                </EmptyDescription>
              </EmptyHeader>
              {filter === "ALL" ? (
                <EmptyContent>
                  <Button asChild>
                    <Link href="/shortlets">Explore shortlets</Link>
                  </Button>
                </EmptyContent>
              ) : null}
            </Empty>
          )}
        </>
      ) : null}
    </div>
  );
}
