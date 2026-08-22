"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Filter,
  Hourglass,
  KeyRound,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminShortletBookings } from "@/features/admin/hooks/use-admin-dashboard";
import {
  bookingDateShort,
  bookingGuests,
  bookingReference,
  bookingStatusLabel,
  currency,
} from "@/features/admin/lib/admin-shortlet-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type {
  AdminShortletBookingsResult,
  ShortletBooking,
  ShortletBookingStatus,
} from "@/services/shortlet-booking.service";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const PAGE_LOAD_TIME = Date.now();

export function AdminShortletBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [stayDate, setStayDate] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const query = useAdminShortletBookings(page, PAGE_SIZE);
  const bookings = useMemo(
    () =>
      (query.data?.bookings ?? []).filter((booking) => {
        const paid = (booking.paymentStatus ?? "").toUpperCase() === "PAID";
        const checkIn = new Date(booking.checkIn).getTime();
        return (
          (status === "ALL" || booking.status === status) &&
          (payment === "ALL" || (payment === "PAID") === paid) &&
          (stayDate === "ALL" ||
            (stayDate === "UPCOMING"
              ? checkIn >= PAGE_LOAD_TIME
              : checkIn < PAGE_LOAD_TIME))
        );
      }),
    [payment, query.data?.bookings, status, stayDate],
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Shortlet Bookings Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Overview and control of all short-term rental operations.
          </p>
        </header>
        <BookingStats data={query.data} loading={query.isLoading} />
        <Card className="mt-10 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 bg-surface/60 p-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 font-semibold">
                <Filter className="size-4" /> Filter by:
              </div>
              <div className="grid flex-1 gap-3 sm:grid-cols-3 lg:max-w-2xl">
                <FilterSelect
                  value={status}
                  setValue={setStatus}
                  label="Status"
                  items={[
                    "ALL",
                    "PENDING",
                    "CONFIRMED",
                    "CHECKED_IN",
                    "COMPLETED",
                    "CANCELLED",
                  ]}
                />
                <FilterSelect
                  value={stayDate}
                  setValue={setStayDate}
                  label="Stay Date"
                  items={["ALL", "UPCOMING", "PAST"]}
                />
                <FilterSelect
                  value={payment}
                  setValue={setPayment}
                  label="Payment"
                  items={["ALL", "PAID", "UNPAID"]}
                />
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setStatus("ALL");
                  setStayDate("ALL");
                  setPayment("ALL");
                }}
              >
                Clear Filters
              </Button>
            </div>
            <div className="overflow-x-auto border-t">
              <Table className="min-w-[1050px]">
                <TableHeader className="bg-primary/5">
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Guest &amp; Vendor</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Amount &amp; Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.isLoading ? (
                    <LoadingRows />
                  ) : (
                    bookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {!query.isLoading && !bookings.length && (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
                <ClipboardList className="size-12 text-muted-foreground" />
                <p className="text-lg font-semibold">
                  No shortlet bookings found
                </p>
                <p className="text-sm text-muted-foreground">
                  No booking records match the current filters.
                </p>
              </div>
            )}
            <Pagination data={query.data} page={page} setPage={setPage} />
          </CardContent>
        </Card>
      </main>
    </AdminWorkspace>
  );
}

function BookingStats({
  data,
  loading,
}: {
  data?: AdminShortletBookingsResult;
  loading: boolean;
}) {
  const cards = [
    {
      label: "Total Bookings",
      value: data?.stats.total ?? 0,
      icon: ClipboardList,
    },
    {
      label: "Pending Requests",
      value: data?.stats.pending ?? 0,
      icon: Hourglass,
      tone: "warning",
    },
    {
      label: "Upcoming Stays",
      value: data?.stats.upcoming ?? 0,
      icon: CalendarDays,
    },
    {
      label: "Currently Checked In",
      value: data?.stats.checkedIn ?? 0,
      icon: KeyRound,
      tone: "muted",
    },
    {
      label: "Completed Bookings",
      value: data?.stats.completed ?? 0,
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "Issues / Cancelled",
      value: data?.stats.cancelled ?? 0,
      icon: AlertTriangle,
      tone: "destructive",
    },
  ];
  return (
    <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <Card
          key={label}
          className={cn(
            "min-h-36",
            tone === "destructive" && "border-destructive bg-destructive/5",
          )}
        >
          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex justify-between gap-3">
              <p
                className={cn(
                  "max-w-28 text-sm font-medium leading-tight text-muted-foreground",
                  tone === "destructive" && "text-destructive",
                )}
              >
                {label}
              </p>
              <Icon
                className={cn(
                  "size-5 text-primary",
                  tone === "warning" && "text-warning",
                  tone === "muted" && "text-muted-foreground",
                  tone === "success" && "text-success",
                  tone === "destructive" && "text-destructive",
                )}
              />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p
                className={cn(
                  "text-2xl font-semibold",
                  tone === "destructive" && "text-destructive",
                )}
              >
                {value.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function BookingRow({ booking }: { booking: ShortletBooking }) {
  const paid = (booking.paymentStatus ?? "").toUpperCase() === "PAID";
  return (
    <TableRow>
      <TableCell className="font-semibold text-primary">
        {bookingReference(booking.id)}
      </TableCell>
      <TableCell>
        <div className="flex min-w-52 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {booking.propertyImageUrl && (
              <Image
                src={booking.propertyImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            )}
          </div>
          <div>
            <p className="font-semibold">{booking.propertyName}</p>
            <p className="text-xs text-muted-foreground">
              {booking.propertyLocation ?? "Location not provided"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p>{booking.guestName}</p>
        <p className="text-xs text-muted-foreground">
          via {booking.vendorName ?? "Direct Booking"}
        </p>
      </TableCell>
      <TableCell>
        <p>
          {bookingDateShort(booking.checkIn)} –{" "}
          {bookingDateShort(booking.checkOut)}
        </p>
        <p className="text-xs text-muted-foreground">
          {bookingGuests(booking)} Guests • {booking.nights} Nights
        </p>
      </TableCell>
      <TableCell>
        <p className="font-medium">{currency(booking.amount)}</p>
        <Badge
          variant={paid ? "secondary" : "outline"}
          className={cn(
            "mt-1",
            paid ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
          )}
        >
          {paid ? "Paid" : "Pending"}
        </Badge>
      </TableCell>
      <TableCell>
        <BookingStatus status={booking.status} />
      </TableCell>
      <TableCell className="text-right">
        <Button size="icon" variant="ghost" asChild>
          <Link
            href={`/admin/shortlet-bookings/${booking.id}`}
            aria-label={`View ${bookingReference(booking.id)}`}
          >
            <Eye />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
function BookingStatus({ status }: { status: ShortletBookingStatus }) {
  return (
    <Badge
      variant={status === "CANCELLED" ? "destructive" : "outline"}
      className={cn(
        status === "PENDING" && "border-warning/20 bg-warning/10 text-warning",
        status === "CONFIRMED" &&
          "border-primary/20 bg-primary/10 text-primary",
        status === "CHECKED_IN" &&
          "border-secondary/20 bg-secondary/10 text-secondary",
        status === "COMPLETED" &&
          "border-success/20 bg-success/10 text-success",
      )}
    >
      ● {bookingStatusLabel(status)}
    </Badge>
  );
}
function FilterSelect({
  value,
  setValue,
  label,
  items,
}: {
  value: string;
  setValue: (value: string) => void;
  label: string;
  items: string[];
}) {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {label}:{" "}
              {item
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
function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 7 }, (__, cell) => (
            <TableCell key={cell}>
              <Skeleton className="h-9 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
function Pagination({
  data,
  page,
  setPage,
}: {
  data?: AdminShortletBookingsResult;
  page: number;
  setPage: (page: number) => void;
}) {
  const total = data?.pagination.total ?? 0;
  const pages = data?.pagination.pages ?? 1;
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
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>
        <Badge>{page}</Badge>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
