"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, LoaderCircle, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Price } from "@/components/shared/price";
import {
  PURPOSE_LABELS,
  PURPOSE_BADGE_STYLES,
} from "@/features/properties/utils/property-labels";
import type { Property } from "@/features/properties/types";
import { cn } from "@/lib/utils";
import { api } from "@/services/axios";
import { getApiErrorMessage } from "@/services/api-error";
import { useAuthStore } from "@/store/auth.store";

type ContactMode = "message" | "inspection" | null;

export function VendorContactCard({ property }: { property: Property }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mode, setMode] = useState<ContactMode>(null);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingType, setMeetingType] = useState("IN_PERSON");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openContact = (nextMode: Exclude<ContactMode, null>) => {
    if (!isAuthenticated) {
      toast.info("Please log in to contact this vendor.");
      router.push(`/login?redirect=/properties/${property.id}`);
      return;
    }
    setSubmitted(false);
    setMode(nextMode);
  };

  const submitInquiry = async () => {
    setSubmitted(true);
    const needsSchedule = mode === "inspection";
    if ((!needsSchedule && !message.trim()) || (needsSchedule && (!date || !time)))
      return;

    setSubmitting(true);
    try {
      const scheduledAt = needsSchedule
        ? new Date(`${date}T${time}`).toISOString()
        : undefined;
      await api.post("/inquiries", {
        propertyId: property.id,
        buyerId: user?.id ?? userId ?? undefined,
        name: user?.fullName ?? "PropertyArk user",
        location:
          user?.location ??
          `${property.location.city}, ${property.location.state}`,
        message:
          message.trim() ||
          `I would like to book an inspection for ${property.title}.`,
        meetingType,
        ...(scheduledAt
          ? {
              inspectionDate: scheduledAt,
              scheduledDate: scheduledAt,
              time,
            }
          : {}),
      });
      toast.success(
        needsSchedule
          ? "Your inspection request was sent to the vendor."
          : "Your message was sent to the vendor.",
      );
      setMode(null);
      setMessage("");
      setDate("");
      setTime("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Your request could not be sent."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span className="text-secondary">★</span>
        {property.title}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold",
            PURPOSE_BADGE_STYLES[property.purpose],
          )}
        >
          {PURPOSE_LABELS[property.purpose]}
        </span>
        {property.rating && (
          <span className="text-xs text-muted-foreground">
            ★★★★★ ({property.reviewCount} Reviews)
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {property.location.address}, {property.location.city}
      </p>

      <Price
        amount={property.price}
        currency={property.currency}
        className="mt-3 block text-xl font-bold text-primary"
      />

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contact Vendor
      </p>

      <div className="mt-3 rounded-xl bg-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {property.vendorName?.slice(0, 2) ?? "V"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {property.vendorName ?? "Vendor"}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {property.vendorPhone ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg py-5"
            asChild={Boolean(property.vendorPhone)}
          >
            {property.vendorPhone ? (
              <a href={`tel:${property.vendorPhone}`}>Call Now</a>
            ) : (
              "Call Now"
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-lg py-5"
            onClick={() => openContact("message")}
          >
            <MessageSquare data-icon="inline-start" />
            Send A Message
          </Button>
        </div>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => openContact("inspection")}
        >
          <CalendarCheck2 data-icon="inline-start" />
          Book Inspection
        </Button>
      </div>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "inspection" ? "Book an Inspection" : "Send a Message"}
            </DialogTitle>
            <DialogDescription>
              {mode === "inspection"
                ? `Request a convenient viewing time for ${property.title}.`
                : `Send a quick property inquiry to ${property.vendorName ?? "the vendor"}.`}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {mode === "inspection" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={submitted && !date}>
                    <FieldLabel htmlFor="inspection-date">Date</FieldLabel>
                    <Input
                      id="inspection-date"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={date}
                      aria-invalid={submitted && !date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                    {submitted && !date && <FieldError>Select a date.</FieldError>}
                  </Field>
                  <Field data-invalid={submitted && !time}>
                    <FieldLabel htmlFor="inspection-time">Time</FieldLabel>
                    <Input
                      id="inspection-time"
                      type="time"
                      value={time}
                      aria-invalid={submitted && !time}
                      onChange={(event) => setTime(event.target.value)}
                    />
                    {submitted && !time && <FieldError>Select a time.</FieldError>}
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="inspection-type">Inspection type</FieldLabel>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger id="inspection-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="IN_PERSON">Physical visit</SelectItem>
                        <SelectItem value="VIDEO_CALL">Video call</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}
            <Field
              data-invalid={
                mode === "message" && submitted && !message.trim()
              }
            >
              <FieldLabel htmlFor="vendor-message">
                {mode === "inspection" ? "Additional note" : "Message"}
              </FieldLabel>
              <Textarea
                id="vendor-message"
                rows={5}
                maxLength={500}
                value={message}
                aria-invalid={
                  mode === "message" && submitted && !message.trim()
                }
                placeholder={
                  mode === "inspection"
                    ? "Tell the vendor anything they should know before the visit..."
                    : "Hello, I’m interested in this property..."
                }
                onChange={(event) => setMessage(event.target.value)}
              />
              {mode === "message" && submitted && !message.trim() && (
                <FieldError>Enter a message for the vendor.</FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>
              Cancel
            </Button>
            <Button disabled={submitting} onClick={submitInquiry}>
              {submitting && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              {mode === "inspection" ? "Request Inspection" : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
