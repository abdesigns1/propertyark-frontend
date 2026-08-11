"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck2,
  LoaderCircle,
  MessageSquare,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import { getApiErrorMessage } from "@/services/api-error";
import { inspectionService } from "@/services/inspection.service";
import { useAuthStore } from "@/store/auth.store";

type ContactMode = "inspection" | null;

export function VendorContactCard({ property }: { property: Property }) {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const requireAuthentication = (action: string) => {
    if (!isAuthenticated) {
      toast.info(`Please log in to ${action}.`);
      router.push(`/login?redirect=/properties/${property.id}`);
      return false;
    }
    return true;
  };

  const openInspection = () => {
    if (!requireAuthentication("book an inspection")) return;
    setSubmitted(false);
    setMode("inspection");
  };

  const openVendorChat = () => {
    if (!requireAuthentication("message the vendor")) return;
    toast.info("Direct messaging is coming soon", {
      description: `Your conversation with ${property.vendorName ?? "this vendor"} will open here once chat is available.`,
    });
  };

  const submitInquiry = async () => {
    setSubmitted(true);
    if (!date || !time) return;

    setSubmitting(true);
    try {
      await inspectionService.schedule({
        propertyId: property.id,
        buyerId: user?.id ?? userId,
        name: user?.fullName ?? "PropertyArk user",
        location:
          user?.location ??
          `${property.location.city}, ${property.location.state}`,
        message:
          message.trim() ||
          `I would like to book an inspection for ${property.title}.`,
        meetingType: meetingType as "IN_PERSON" | "VIDEO_CALL",
        date,
        time,
      });
      await queryClient.invalidateQueries({
        queryKey: ["buyer", "inspections"],
      });
      toast.success("Inspection booked successfully", {
        description: "The vendor has received your preferred date and time.",
      });
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
            {property.vendorAvatarUrl && (
              <AvatarImage
                src={property.vendorAvatarUrl}
                alt={property.vendorName ?? "Vendor"}
              />
            )}
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
              {isAuthenticated
                ? (property.vendorPhone ?? "Contact unavailable")
                : "••••••••••"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {isAuthenticated && property.vendorPhone ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg py-5"
              asChild
            >
              <a href={`tel:${property.vendorPhone}`}>
                <Phone data-icon="inline-start" /> Call Now
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg py-5"
              disabled={isAuthenticated && !property.vendorPhone}
              onClick={() => requireAuthentication("view the vendor contact")}
            >
              <Phone data-icon="inline-start" /> Call Now
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1 rounded-lg py-5"
            onClick={openVendorChat}
          >
            <MessageSquare data-icon="inline-start" />
            Send A Message
          </Button>
        </div>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={openInspection}
        >
          <CalendarCheck2 data-icon="inline-start" />
          Book Inspection
        </Button>
      </div>

      <Dialog
        open={mode !== null}
        onOpenChange={(open) => !open && setMode(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book an Inspection</DialogTitle>
            <DialogDescription>
              Request a convenient viewing time for {property.title}.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
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
                  {submitted && !date && (
                    <FieldError>Select a date.</FieldError>
                  )}
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
                  {submitted && !time && (
                    <FieldError>Select a time.</FieldError>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="inspection-type">
                  Inspection type
                </FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="vendor-message">Additional note</FieldLabel>
              <Textarea
                id="vendor-message"
                rows={5}
                maxLength={500}
                value={message}
                placeholder="Tell the vendor anything they should know before the visit..."
                onChange={(event) => setMessage(event.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>
              Cancel
            </Button>
            <Button disabled={submitting} onClick={submitInquiry}>
              {submitting && (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              Book Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
