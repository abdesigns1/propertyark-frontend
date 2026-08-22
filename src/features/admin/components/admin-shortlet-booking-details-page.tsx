"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  Download,
  Eye,
  KeyRound,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  ReceiptText,
  ShieldAlert,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminShortletBooking } from "@/features/admin/hooks/use-admin-dashboard";
import {
  bookingDate,
  bookingGuests,
  bookingReference,
  bookingStatusLabel,
  currency,
} from "@/features/admin/lib/admin-shortlet-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShortletBooking } from "@/services/shortlet-booking.service";

export function AdminShortletBookingDetailsPage({
  bookingId,
}: {
  bookingId: string;
}) {
  const query = useAdminShortletBooking(bookingId);

  if (query.isLoading)
    return (
      <AdminWorkspace>
        <DetailsSkeleton />
      </AdminWorkspace>
    );
  if (!query.data)
    return (
      <AdminWorkspace>
        <EmptyDetails />
      </AdminWorkspace>
    );

  return (
    <AdminWorkspace>
      <BookingDetails booking={query.data} />
    </AdminWorkspace>
  );
}

function BookingDetails({ booking }: { booking: ShortletBooking }) {
  const reference = bookingReference(booking.id);
  const paid = (booking.paymentStatus ?? "").toUpperCase() === "PAID";
  const serviceFee = Math.round(booking.amount * 0.025);

  function exportBooking() {
    const summary = [
      `Booking: ${reference}`,
      `Property: ${booking.propertyName}`,
      `Guest: ${booking.guestName}`,
      `Vendor: ${booking.vendorName ?? "Not provided"}`,
      `Stay: ${bookingDate(booking.checkIn)} - ${bookingDate(booking.checkOut)}`,
      `Amount: ${currency(booking.amount)}`,
      `Status: ${bookingStatusLabel(booking.status)}`,
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reference}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <Button variant="link" className="h-auto px-0" asChild>
        <Link href="/admin/shortlet-bookings">
          <ArrowLeft /> Back to Bookings
        </Link>
      </Button>
      <header className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Booking Details
            </h1>
            <Badge className="bg-primary/10 text-primary">
              ✓ {bookingStatusLabel(booking.status)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Ref: {reference} • Created{" "}
            {bookingDate(booking.requestedAt ?? booking.checkIn)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBooking}>
            <Download /> Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Actions <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() =>
                  toast.info(
                    "Guest messaging will use the communications endpoint when available.",
                  )
                }
              >
                Message guest
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.info(
                    "Vendor messaging will use the communications endpoint when available.",
                  )
                }
              >
                Message vendor
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() =>
                  toast.info(
                    "Dispute workflow requires a backend action endpoint.",
                  )
                }
              >
                Raise dispute
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,2.15fr)_minmax(290px,0.8fr)]">
        <div className="space-y-6">
          <StaySummary booking={booking} paid={paid} />
          <PropertySummary booking={booking} />
          <div className="grid gap-6 md:grid-cols-2">
            <PersonCard type="Guest" booking={booking} />
            <PersonCard type="Vendor" booking={booking} />
          </div>
          <div className="grid items-stretch gap-6 md:grid-cols-[0.72fr_1.48fr]">
            <div className="grid gap-4">
              <TimeCard
                label="Check-In Times"
                scheduled={booking.checkIn}
                actual={booking.checkInTime}
              />
              <TimeCard
                label="Check-Out Times"
                scheduled={booking.checkOut}
                actual={booking.checkOutTime}
              />
            </div>
            <PaymentCard
              booking={booking}
              serviceFee={serviceFee}
              paid={paid}
            />
          </div>
          <Lifecycle booking={booking} />
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24">
          <QuickActions booking={booking} />
          <Card>
            <CardHeader>
              <CardTitle>Support Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                If there are issues with this booking, reference ID {reference}{" "}
                when contacting level 2 support.
              </p>
              <Button variant="link" className="h-auto px-0">
                <ShieldAlert /> Open Support Ticket
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function StaySummary({
  booking,
  paid,
}: {
  booking: ShortletBooking;
  paid: boolean;
}) {
  return (
    <Card>
      <CardContent className="grid gap-8 py-7 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <Metric label="Check-In" value={bookingDate(booking.checkIn)} />
        <div className="flex flex-col items-center gap-2">
          <Badge variant="secondary">{booking.nights} Nights</Badge>
          <span className="text-primary">→</span>
          <span className="flex items-center gap-2 text-sm">
            <Users className="size-4" /> {bookingGuests(booking)} guests
          </span>
        </div>
        <div className="sm:text-right">
          <Metric label="Check-Out" value={bookingDate(booking.checkOut)} />
          <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">
            Total Amount
          </p>
          <p className="text-2xl font-semibold">{currency(booking.amount)}</p>
          <p className={paid ? "text-sm text-success" : "text-sm text-warning"}>
            {paid ? "✓ Paid" : "Pending payment"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function PropertySummary({ booking }: { booking: ShortletBooking }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between border-b bg-primary/5">
        <CardTitle>Shortlet Property</CardTitle>
        {booking.propertyId !== "unknown-property" && (
          <Button variant="link" asChild>
            <Link href={`/admin/properties/${booking.propertyId}`}>
              View Listing
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-6 sm:flex-row">
        <div className="relative h-36 w-full overflow-hidden rounded-lg bg-muted sm:w-48">
          {booking.propertyImageUrl ? (
            <Image
              src={booking.propertyImageUrl}
              alt={booking.propertyName}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <Building2 className="absolute inset-0 m-auto size-12 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{booking.propertyName}</h2>
            <Badge variant="secondary">Verified Property</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            {booking.propertyLocation ?? "Location not provided"}
          </p>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <Metric
              label="Property Type"
              value={booking.propertyType ?? "Shortlet"}
            />
            <Metric
              label="Base Rate"
              value={
                booking.nights
                  ? `${currency(booking.amount / booking.nights)} / night`
                  : "Not provided"
              }
            />
            <Metric label="Property ID" value={booking.propertyId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonCard({
  type,
  booking,
}: {
  type: "Guest" | "Vendor";
  booking: ShortletBooking;
}) {
  const guest = type === "Guest";
  const name = guest
    ? booking.guestName
    : (booking.vendorName ?? "Vendor not provided");
  const email = guest ? booking.guestEmail : booking.vendorEmail;
  const phone = guest ? booking.guestPhone : booking.vendorPhone;
  const id = guest ? booking.guestId : booking.vendorId;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {guest ? <UserRound /> : <Building2 />} {type} Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={guest ? booking.guestAvatarUrl : undefined} />
            <AvatarFallback>
              {guest ? booking.guestInitials : "VE"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              {guest ? "PropertyArk User" : "Listing Vendor"}
            </p>
          </div>
          {id && (
            <Button variant="secondary" asChild>
              <Link href={`/admin/users/${id}`}>View Profile</Link>
            </Button>
          )}
        </div>
        <div className="mt-5 space-y-3 border-t pt-4 text-sm">
          <p className="flex justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> Email
            </span>
            <span>{email ?? "Not provided"}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" /> Phone
            </span>
            <span>{phone ?? "Not provided"}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TimeCard({
  label,
  scheduled,
  actual,
}: {
  label: string;
  scheduled: string;
  actual?: string;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <KeyRound className="size-4" /> {label}
        </h3>
        <div className="mt-4 rounded-lg bg-primary/5 p-4 text-sm">
          <p className="flex justify-between">
            <span>Scheduled:</span>
            <strong>{bookingDate(scheduled)}</strong>
          </p>
          <p className="mt-3 flex justify-between">
            <span>Actual:</span>
            <strong className="text-primary">{actual ?? "Not recorded"}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({
  booking,
  serviceFee,
  paid,
}: {
  booking: ShortletBooking;
  serviceFee: number;
  paid: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <WalletCards /> Payment Breakdown
        </CardTitle>
        <Badge>{paid ? "Fully Paid" : "Pending"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaymentLine
          label={`Accommodation (${booking.nights} Nights)`}
          value={booking.amount}
        />
        <PaymentLine label="Platform Service Fee (2.5%)" value={serviceFee} />
        <div className="flex items-end justify-between rounded-lg border bg-primary/5 p-5">
          <span className="text-lg font-semibold">Total Paid</span>
          <strong className="text-3xl text-primary">
            {currency(paid ? booking.amount + serviceFee : 0)}
          </strong>
        </div>
        <Button variant="link" className="float-right">
          <ReceiptText /> View Transaction Receipt
        </Button>
      </CardContent>
    </Card>
  );
}
function PaymentLine({ label, value }: { label: string; value: number }) {
  return (
    <p className="flex justify-between gap-5 border-b pb-4">
      <span>{label}</span>
      <span>{currency(value)}</span>
    </p>
  );
}

function Lifecycle({ booking }: { booking: ShortletBooking }) {
  const steps = [
    {
      title: "Booking Requested",
      detail: "Guest initiated the shortlet booking request.",
      actor: "Guest",
      active: true,
    },
    {
      title: "Request Accepted",
      detail: "Vendor reviewed and accepted the booking dates.",
      actor: "Vendor",
      active: booking.status !== "PENDING",
    },
    {
      title: "Payment Confirmed",
      detail: "Booking payment was received and recorded.",
      actor: "System",
      active: ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(booking.status),
    },
    {
      title: "Guest Checked In",
      detail: "Property access and guest arrival were confirmed.",
      actor: "Vendor",
      active: ["CHECKED_IN", "COMPLETED"].includes(booking.status),
    },
    {
      title: "Completed & Checked Out",
      detail: "Guest checked out and the stay was completed.",
      actor: "System",
      active: booking.status === "COMPLETED",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck /> Booking Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative grid grid-cols-[32px_1fr] gap-4 pb-6 last:pb-0"
          >
            <div className="relative flex justify-center">
              <span
                className={`z-10 mt-1 size-4 rounded-full border-2 border-primary ${step.active ? "bg-primary" : "bg-background"}`}
              />
              {index < steps.length - 1 && (
                <span className="absolute bottom-0 top-4 w-px bg-primary/30" />
              )}
            </div>
            <div
              className={`rounded-lg border p-4 ${step.active ? "bg-primary/5" : "opacity-60"}`}
            >
              <p className="font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.detail}
              </p>
              <Badge variant="secondary" className="mt-3">
                Actor: {step.actor}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickActions({ booking }: { booking: ShortletBooking }) {
  const action = (message: string) => toast.info(message);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          className="w-full justify-between"
          variant="secondary"
          onClick={() =>
            action(
              `Messaging ${booking.guestName} requires the communications endpoint.`,
            )
          }
        >
          Message Guest <MessageSquareText />
        </Button>
        <Button
          className="w-full justify-between"
          variant="secondary"
          onClick={() =>
            action("Vendor messaging requires the communications endpoint.")
          }
        >
          Message Vendor <Building2 />
        </Button>
        <Button
          className="w-full justify-between"
          variant="secondary"
          onClick={() => action("Escrow details require the finance endpoint.")}
        >
          View Escrow Status <WalletCards />
        </Button>
        <div className="pt-3">
          <Button
            className="w-full justify-between"
            variant="destructive"
            onClick={() =>
              action("Dispute management requires a booking dispute endpoint.")
            }
          >
            Raise Dispute <ShieldAlert />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailsSkeleton() {
  return (
    <main className="mx-auto max-w-[1500px] space-y-6 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-14 w-80" />
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {[180, 250, 230, 420].map((height) => (
            <Skeleton key={height} style={{ height }} className="w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  );
}
function EmptyDetails() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
          <Eye className="size-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Booking details unavailable</h1>
          <p className="max-w-md text-muted-foreground">
            The current backend did not return this booking record. Use the
            booking list to select an available booking.
          </p>
          <Button asChild>
            <Link href="/admin/shortlet-bookings">Back to Bookings</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
