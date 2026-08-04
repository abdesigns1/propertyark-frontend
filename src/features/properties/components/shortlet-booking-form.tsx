"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { differenceInCalendarDays, format } from "date-fns";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Property } from "@/features/properties/types";

interface BookingFormProps { property: Property; checkIn: string; checkOut: string; guests: number }

export function ShortletBookingForm({ property, checkIn, checkOut, guests }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const nights = useMemo(() => Math.max(1, differenceInCalendarDays(new Date(checkOut), new Date(checkIn))), [checkIn, checkOut]);
  const subtotal = property.price * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    toast.success("Booking request saved", { description: "We’ll connect this to the shortlet endpoint as soon as it is available." });
  }

  if (submitted) return (
    <Card className="mx-auto max-w-xl py-12 text-center shadow-lg">
      <CardContent className="flex flex-col items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="size-8" /></span>
        <h1 className="text-2xl font-bold">Booking request received</h1>
        <p className="max-w-md text-muted-foreground">Your stay at {property.title} has been prepared. Payment and confirmation will be enabled when the booking endpoint is connected.</p>
      </CardContent>
    </Card>
  );

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-5">
          <div><p className="text-sm font-semibold text-primary">Almost there</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Complete your booking</h1><p className="mt-2 text-muted-foreground">Enter the lead guest&apos;s details exactly as they appear on a valid ID.</p></div>
          <Card>
            <CardHeader><CardTitle>Your trip</CardTitle></CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Check-in</p><p className="mt-1 font-medium">{format(new Date(checkIn), "MMM d, yyyy")}</p></div>
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Check-out</p><p className="mt-1 font-medium">{format(new Date(checkOut), "MMM d, yyyy")}</p></div>
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Guests</p><p className="mt-1 font-medium">{guests} {guests === 1 ? "guest" : "guests"}</p></div>
            </CardContent>
          </Card>
        </section>

        <FieldSet>
          <FieldLegend className="text-2xl font-semibold">Guest information</FieldLegend>
          <FieldDescription>We&apos;ll send the booking confirmation to the contact below.</FieldDescription>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field><FieldLabel htmlFor="first-name">First name</FieldLabel><Input id="first-name" name="firstName" required placeholder="Emilly" /></Field>
              <Field><FieldLabel htmlFor="last-name">Last name</FieldLabel><Input id="last-name" name="lastName" required placeholder="Morgan" /></Field>
              <Field><FieldLabel htmlFor="email">Email address</FieldLabel><Input id="email" name="email" type="email" required placeholder="you@example.com" /></Field>
              <Field><FieldLabel htmlFor="phone">Phone number</FieldLabel><Input id="phone" name="phone" type="tel" required placeholder="+234 800 000 0000" /></Field>
            </div>
            <Field><FieldLabel htmlFor="request">Special request <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel><Input id="request" name="request" placeholder="Airport pickup, early check-in..." /></Field>
          </FieldGroup>
        </FieldSet>
      </div>

      <Card className="shadow-lg lg:sticky lg:top-28">
        <CardHeader><CardTitle>Booking summary</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl"><Image src={property.images[0]} alt="" fill className="object-cover" /></div>
            <div className="min-w-0"><h2 className="font-semibold leading-snug">{property.title}</h2><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin /> {property.location.city}, {property.location.state}</p><p className="mt-2 flex items-center gap-1 text-xs"><Star className="fill-warning text-warning" /> {property.rating ?? "New"} <span className="text-muted-foreground">({property.reviewCount ?? 0} reviews)</span></p></div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/60 p-4 text-sm"><div><p className="text-xs text-muted-foreground">Check-in</p><p className="mt-1 font-medium">{format(new Date(checkIn), "MMM d, yyyy")}</p></div><div><p className="text-xs text-muted-foreground">Check-out</p><p className="mt-1 font-medium">{format(new Date(checkOut), "MMM d, yyyy")}</p></div></div>
          <div className="flex flex-col gap-3 text-sm"><div className="flex justify-between text-muted-foreground"><span>₦{property.price.toLocaleString()} × {nights} nights</span><span className="font-numeric">₦{subtotal.toLocaleString()}</span></div><div className="flex justify-between text-muted-foreground"><span>Service fee</span><span className="font-numeric">₦{serviceFee.toLocaleString()}</span></div><Separator /><div className="flex justify-between text-base font-bold"><span>Total</span><span className="font-numeric">₦{total.toLocaleString()}</span></div></div>
        </CardContent>
        <CardFooter className="flex-col gap-3 border-0 bg-card pt-0"><Button type="submit" size="lg" className="w-full">Request to book</Button><p className="text-center text-xs text-muted-foreground">No payment will be taken until the booking API is connected.</p></CardFooter>
      </Card>
    </form>
  );
}
