"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  setDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/shared/price";
import type { Property } from "@/features/properties/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const UNAVAILABLE_DATES: Date[] = [];

export function ShortletBookingCard({ property }: { property: Property }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialMonth = startOfMonth(addMonths(new Date(), 1));
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [checkIn, setCheckIn] = useState(setDate(initialMonth, 15));
  const [checkOut, setCheckOut] = useState(setDate(initialMonth, 18));
  const [selectingCheckout, setSelectingCheckout] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestPickerOpen, setGuestPickerOpen] = useState(false);
  const guests = adults + children;

  // Keep this empty until the API exposes property-specific blocked/booked dates.
  // Appointment availability cannot safely be used because it is not scoped to a property.
  const unavailableDates = UNAVAILABLE_DATES;

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(visibleMonth)),
        end: endOfWeek(endOfMonth(visibleMonth)),
      }),
    [visibleMonth],
  );
  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));

  function isUnavailable(day: Date) {
    return unavailableDates.some((unavailableDay) => isSameDay(day, unavailableDay));
  }

  function rangeContainsUnavailable(start: Date, end: Date) {
    if (!isBefore(start, end)) return false;
    return eachDayOfInterval({ start, end }).some(isUnavailable);
  }

  function updateCheckIn(value: string) {
    if (!value) return;
    const nextDate = parseISO(value);
    if (isUnavailable(nextDate)) {
      toast.error("That check-in date is unavailable.");
      return;
    }
    setCheckIn(nextDate);
    setVisibleMonth(startOfMonth(nextDate));
    if (!isBefore(nextDate, checkOut) || rangeContainsUnavailable(nextDate, checkOut)) {
      setCheckOut(nextDate);
      setSelectingCheckout(true);
    }
  }

  function updateCheckOut(value: string) {
    if (!value) return;
    const nextDate = parseISO(value);
    if (!isBefore(checkIn, nextDate)) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    if (isUnavailable(nextDate) || rangeContainsUnavailable(checkIn, nextDate)) {
      toast.error("Your stay includes an unavailable date.");
      return;
    }
    setCheckOut(nextDate);
    setVisibleMonth(startOfMonth(nextDate));
    setSelectingCheckout(false);
  }

  function selectDay(day: Date) {
    if (isBefore(day, startOfDay(new Date())) || isUnavailable(day)) return;
    if (!selectingCheckout || !isBefore(checkIn, day)) {
      setCheckIn(day);
      setCheckOut(day);
      setSelectingCheckout(true);
      return;
    }
    if (rangeContainsUnavailable(checkIn, day)) {
      toast.error("Your stay cannot include unavailable dates.");
      return;
    }
    setCheckOut(day);
    setSelectingCheckout(false);
  }

  function continueToBooking() {
    const query = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests: String(guests),
      adults: String(adults),
      children: String(children),
    });
    router.push(`/shortlets/${property.id}/book?${query}`);
  }

  function requireAuthentication(action: "call" | "message") {
    if (isAuthenticated) return true;
    toast.info(`Please log in to ${action} the vendor.`);
    router.push(`/login?redirect=/properties/${property.id}`);
    return false;
  }

  function openVendorChat() {
    if (!requireAuthentication("message")) return;
    toast.info("Direct messaging is coming soon", {
      description: `Your conversation with ${property.vendorName ?? "this vendor"} will open here once chat is available.`,
    });
  }

  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-sm lg:sticky lg:top-28">
      <CardHeader className="gap-3 px-6 pb-5 pt-6">
        <CardTitle className="flex items-start gap-2 text-base font-semibold">
          <Star className="mt-0.5 fill-secondary text-secondary" />
          <span className="leading-snug">{property.title}</span>
        </CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Short Let</Badge>
          <span className="flex items-center gap-0.5 text-warning" aria-label={`${property.rating ?? 5} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={cn("size-3.5", index < Math.round(property.rating ?? 5) && "fill-warning")} />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">({property.reviewCount ?? 2} Reviews)</span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-4" />
          {property.location.address}, {property.location.city}
        </p>

        <div className="flex items-end gap-1 pt-2">
          <Price amount={property.price} currency={property.currency} className="text-2xl font-bold text-primary" />
          <span className="pb-1 text-xs text-muted-foreground">/Night</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-6 pb-6">
        <Separator />

        <div className="overflow-hidden rounded-lg border border-primary/25">
          <div className="grid grid-cols-2 bg-primary/5">
            <label className="cursor-pointer border-r border-primary/20 p-3" htmlFor="shortlet-check-in">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Check-in</span>
              <Input id="shortlet-check-in" type="date" min={format(new Date(), "yyyy-MM-dd")} value={format(checkIn, "yyyy-MM-dd")} onChange={(event) => updateCheckIn(event.target.value)} className="mt-1 h-auto border-0 bg-transparent p-0 text-xs font-semibold shadow-none focus-visible:ring-0" />
            </label>
            <label className="cursor-pointer p-3" htmlFor="shortlet-check-out">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Check-out</span>
              <Input id="shortlet-check-out" type="date" min={format(addMonths(checkIn, 0), "yyyy-MM-dd")} value={format(checkOut, "yyyy-MM-dd")} onChange={(event) => updateCheckOut(event.target.value)} className="mt-1 h-auto border-0 bg-transparent p-0 text-xs font-semibold shadow-none focus-visible:ring-0" />
            </label>
          </div>
          <button type="button" className="w-full border-t border-primary/20 p-3 text-left hover:bg-primary/5" onClick={() => setGuestPickerOpen((open) => !open)} aria-expanded={guestPickerOpen}>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Guests</span>
            <span className="mt-1 block text-xs">{adults} {adults === 1 ? "Adult" : "Adults"}, {children} {children === 1 ? "Child" : "Children"}</span>
          </button>
          {guestPickerOpen && (
            <div className="flex flex-col gap-3 border-t border-primary/20 bg-background p-3">
              <GuestCounter label="Adults" description="Age 13+" value={adults} minimum={1} onChange={setAdults} />
              <GuestCounter label="Children" description="Ages 0–12" value={children} minimum={0} onChange={setChildren} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4" aria-label="Choose booking dates">
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" size="icon-sm" className="rounded-full" aria-label="Previous month" onClick={() => setVisibleMonth((month) => addMonths(month, -1))}>
              <ChevronLeft />
            </Button>
            <p className="text-xs font-medium">{format(visibleMonth, "MMMM yyyy")}</p>
            <Button type="button" variant="outline" size="icon-sm" className="rounded-full" aria-label="Next month" onClick={() => setVisibleMonth((month) => addMonths(month, 1))}>
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((day) => <span key={day} className="pb-2 text-[10px] font-medium">{day}</span>)}
            {calendarDays.map((day) => {
              const selectedStart = isSameDay(day, checkIn);
              const selectedEnd = isSameDay(day, checkOut);
              const inRange = !isSameDay(checkIn, checkOut) && isWithinInterval(day, { start: checkIn, end: checkOut });
              const unavailable = isUnavailable(day);
              const disabled = isBefore(day, startOfDay(new Date())) || unavailable;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "relative flex h-9 items-center justify-center text-[10px] transition-colors disabled:cursor-not-allowed disabled:text-muted-foreground/25",
                    unavailable && "text-muted-foreground line-through decoration-2 disabled:text-muted-foreground/60",
                    !isSameMonth(day, visibleMonth) && "text-muted-foreground/40",
                    inRange && "bg-primary/10 text-foreground",
                    selectedStart && "rounded-l-md bg-primary font-semibold text-primary-foreground",
                    selectedEnd && "rounded-r-md bg-primary font-semibold text-primary-foreground",
                    selectedStart && selectedEnd && "rounded-md",
                    !disabled && !inRange && !selectedStart && !selectedEnd && "hover:rounded-md hover:bg-muted",
                  )}
                  aria-label={`${format(day, "MMMM d, yyyy")}${unavailable ? ", unavailable" : ""}`}
                  aria-pressed={selectedStart || selectedEnd}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>

        {unavailableDates.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-block w-5 border-t-2 border-muted-foreground" />
            Struck-through dates are unavailable
          </div>
        )}
        <Button size="lg" className="h-11 w-full" onClick={continueToBooking} disabled={selectingCheckout || nights < 1}>Book Now</Button>
      </CardContent>

      <Separator />

      <CardFooter className="flex-col items-stretch gap-3 border-0 bg-card px-6 py-6">
        <p className="text-sm font-semibold">Contact Vendor</p>
        <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {property.vendorAvatarUrl && <AvatarImage src={property.vendorAvatarUrl} alt={property.vendorName ?? "Vendor"} />}
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">{property.vendorName?.split(" ").map((name) => name[0]).join("").slice(0, 2) ?? "V"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{property.vendorName ?? "PropertyArk Vendor"}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-primary">
                <Phone className="size-3.5" />
                {isAuthenticated ? (property.vendorPhone ?? "Contact unavailable") : "••••••••••"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {isAuthenticated && property.vendorPhone ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${property.vendorPhone}`}><Phone data-icon="inline-start" /> Call Now</a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => requireAuthentication("call")} disabled={isAuthenticated && !property.vendorPhone}>
                <Phone data-icon="inline-start" /> Call Now
              </Button>
            )}
            <Button size="sm" className="shadow-md shadow-primary/20" onClick={openVendorChat}>
              <MessageSquare data-icon="inline-start" /> Send Message
            </Button>
          </div>
          {!isAuthenticated && <p className="text-center text-[10px] text-muted-foreground">Log in to reveal the vendor&apos;s contact details.</p>}
        </div>
      </CardFooter>
    </Card>
  );
}

function GuestCounter({ label, description, value, minimum, onChange }: { label: string; description: string; value: number; minimum: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div><p className="text-xs font-semibold">{label}</p><p className="text-[10px] text-muted-foreground">{description}</p></div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon-xs" className="rounded-full" disabled={value <= minimum} aria-label={`Remove ${label.toLowerCase()}`} onClick={() => onChange(Math.max(minimum, value - 1))}><Minus /></Button>
        <span className="w-5 text-center text-xs font-semibold">{value}</span>
        <Button type="button" variant="outline" size="icon-xs" className="rounded-full" disabled={value >= 10} aria-label={`Add ${label.toLowerCase()}`} onClick={() => onChange(Math.min(10, value + 1))}><Plus /></Button>
      </div>
    </div>
  );
}
