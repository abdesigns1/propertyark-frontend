"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { differenceInCalendarDays, format } from "date-fns";
import {
  Banknote,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Star,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Property } from "@/features/properties/types";
import { getApiErrorMessage } from "@/services/api-error";
import {
  shortletBookingService,
  type ShortletPaymentMethod,
} from "@/services/shortlet-booking.service";

interface BookingFormProps {
  property: Property;
  checkIn: string;
  checkOut: string;
  adults: number;
  childGuests: number;
}

export function ShortletBookingForm({
  property,
  checkIn,
  checkOut,
  adults: initialAdults,
  childGuests: initialChildren,
}: BookingFormProps) {
  const [submissionState, setSubmissionState] = useState<
    "idle" | "confirmed" | "confirmation-delayed"
  >("idle");
  const [paymentMethod, setPaymentMethod] = useState<
    ShortletPaymentMethod | ""
  >("");
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const guests = adults + children;
  const nights = useMemo(
    () =>
      Math.max(
        1,
        differenceInCalendarDays(new Date(checkOut), new Date(checkIn)),
      ),
    [checkIn, checkOut],
  );
  const subtotal = property.price * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const booking = useMutation({
    mutationFn: shortletBookingService.create,
    onSuccess: () => {
      setSubmissionState("confirmed");
      toast.success("Booking request sent", {
        description: "The vendor has been notified and will review your stay.",
      });
    },
    onError: (error) => {
      const isUncertainServerResponse =
        axios.isAxiosError(error) &&
        (!error.response ||
          (error.response.status >= 500 && error.response.status < 600));

      if (isUncertainServerResponse) {
        setSubmissionState("confirmation-delayed");
        toast.info("Booking request is being confirmed", {
          description:
            "Please do not submit it again. The vendor may already have received your request.",
        });
        return;
      }

      toast.error(
        getApiErrorMessage(error, "Your booking request could not be sent."),
      );
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paymentMethod) {
      toast.error("Choose Cash or Transfer to continue.");
      return;
    }
    if (adults < 1 || guests > 10) {
      toast.error("A booking must include 1 to 10 guests.");
      return;
    }

    const form = new FormData(event.currentTarget);
    booking.mutate({
      propertyId: property.id,
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      adult: adults,
      child: children,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      paymentMethod,
    });
  }

  if (submissionState !== "idle") {
    const confirmationDelayed = submissionState === "confirmation-delayed";
    return (
      <Card className="mx-auto max-w-xl py-12 text-center shadow-lg">
        <CardContent className="flex flex-col items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="text-2xl font-bold">
            {confirmationDelayed
              ? "Booking request is being confirmed"
              : "Booking request received"}
          </h1>
          <p className="max-w-md text-muted-foreground">
            {confirmationDelayed
              ? `Please do not submit another request for ${property.title}. The vendor may already have received this booking, and confirmation is delayed.`
              : `Your stay at ${property.title} is awaiting vendor approval. You and the vendor will receive booking updates by email.`}
          </p>
          {paymentMethod === "TRANSFER" && (
            <p className="max-w-md text-sm text-muted-foreground">
              Online transfer payment will be enabled when the payment gateway
              is available. Until then, the vendor must approve this request
              manually.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start"
    >
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-primary">Almost there</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Complete your booking
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter the lead guest&apos;s details exactly as they appear on a
              valid ID.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Your trip</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <TripDetail
                label="Check-in"
                value={format(new Date(checkIn), "MMM d, yyyy")}
              />
              <TripDetail
                label="Check-out"
                value={format(new Date(checkOut), "MMM d, yyyy")}
              />
              <TripDetail
                label="Guests"
                value={`${guests} ${guests === 1 ? "guest" : "guests"}`}
              />
            </CardContent>
          </Card>
        </section>

        <FieldSet>
          <FieldLegend className="text-2xl font-semibold">
            Guest information
          </FieldLegend>
          <FieldDescription>
            We&apos;ll send booking updates to the contact below.
          </FieldDescription>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="first-name">First name</FieldLabel>
                <Input
                  id="first-name"
                  name="firstName"
                  required
                  placeholder="Emilly"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                <Input
                  id="last-name"
                  name="lastName"
                  required
                  placeholder="Morgan"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="adult-guests">Adults</FieldLabel>
                <Input
                  id="adult-guests"
                  type="number"
                  min={1}
                  max={10}
                  value={adults}
                  onChange={(event) =>
                    setAdults(Math.max(1, Number(event.target.value) || 1))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="child-guests">Children</FieldLabel>
                <Input
                  id="child-guests"
                  type="number"
                  min={0}
                  max={9}
                  value={children}
                  onChange={(event) =>
                    setChildren(Math.max(0, Number(event.target.value) || 0))
                  }
                />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className="text-2xl font-semibold">
            Payment method
          </FieldLegend>
          <FieldDescription>
            Cash and Transfer bookings currently require vendor approval.
          </FieldDescription>
          <Field>
            <ToggleGroup
              type="single"
              value={paymentMethod}
              onValueChange={(value) =>
                value && setPaymentMethod(value as ShortletPaymentMethod)
              }
              className="h-auto w-full flex-col gap-3 bg-transparent p-0 sm:flex-row"
            >
              <PaymentOption
                value="CASH"
                icon={Banknote}
                title="Cash"
                description="Pay according to the vendor's instructions after approval."
              />
              <PaymentOption
                value="TRANSFER"
                icon={WalletCards}
                title="Transfer"
                description="Online payment will be added when the gateway is available."
              />
            </ToggleGroup>
          </Field>
        </FieldSet>
      </div>

      <Card className="shadow-lg lg:sticky lg:top-28">
        <CardHeader>
          <CardTitle>Booking summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={property.images[0]}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold leading-snug">{property.title}</h2>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin /> {property.location.city}, {property.location.state}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs">
                <Star className="fill-warning text-warning" />
                {property.rating ?? "New"}
                <span className="text-muted-foreground">
                  ({property.reviewCount ?? 0} reviews)
                </span>
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/60 p-4 text-sm">
            <TripDetail
              label="Check-in"
              value={format(new Date(checkIn), "MMM d, yyyy")}
            />
            <TripDetail
              label="Check-out"
              value={format(new Date(checkOut), "MMM d, yyyy")}
            />
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <SummaryLine
              label={`₦${property.price.toLocaleString()} × ${nights} nights`}
              value={subtotal}
            />
            <SummaryLine label="Service fee" value={serviceFee} />
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="font-numeric">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3 border-0 bg-card pt-0">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={booking.isPending || !paymentMethod}
          >
            {booking.isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Send Booking Request
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            The vendor will review your booking before it is confirmed.
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}

function TripDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-numeric">₦{value.toLocaleString()}</span>
    </div>
  );
}

function PaymentOption({
  value,
  icon: Icon,
  title,
  description,
}: {
  value: ShortletPaymentMethod;
  icon: typeof Banknote;
  title: string;
  description: string;
}) {
  return (
    <ToggleGroupItem
      value={value}
      className="h-auto w-full justify-start rounded-xl border p-4 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"
    >
      <Icon className="size-6 text-primary" />
      <span className="flex flex-1 flex-col items-start">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-sm font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    </ToggleGroupItem>
  );
}
