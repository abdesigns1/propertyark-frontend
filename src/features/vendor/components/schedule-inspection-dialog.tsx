"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  Map as MapIcon,
  MapPin,
  Video,
} from "lucide-react";
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
  FieldLegend,
  FieldSet,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useScheduleInspection } from "@/features/vendor/hooks/use-vendor-inspections";
import type { PropertyApiItem } from "@/features/properties/types/api";
import type { VendorInspection } from "@/services/inspection.service";
import { getApiErrorMessage } from "@/services/api-error";

type BuyerOption = {
  id: string;
  backendId: string | null;
  name: string;
  email: string | null;
};

type PropertyOption = {
  id: string;
  name: string;
  location: string;
};

export function ScheduleInspectionDialog({
  open,
  onOpenChange,
  properties,
  inspections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: PropertyApiItem[];
  inspections: VendorInspection[];
}) {
  const schedule = useScheduleInspection();
  const buyers = useMemo(() => uniqueBuyers(inspections), [inspections]);
  const propertyOptions = useMemo(
    () => uniqueProperties(properties, inspections),
    [inspections, properties],
  );
  const [propertyId, setPropertyId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingType, setMeetingType] = useState<"IN_PERSON" | "VIDEO_CALL">("IN_PERSON");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyer = buyers.find((option) => option.id === buyerId) ?? null;
  const property = propertyOptions.find((option) => option.id === propertyId) ?? null;

  const reset = () => {
    schedule.reset();
    setPropertyId("");
    setBuyerId("");
    setDate("");
    setTime("");
    setMeetingType("IN_PERSON");
    setLocation("");
    setNotes("");
    setSubmitted(false);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !schedule.isPending) reset();
    onOpenChange(nextOpen);
  };

  const selectProperty = (value: string) => {
    setPropertyId(value);
    const selected = propertyOptions.find((item) => item.id === value);
    if (selected && meetingType === "IN_PERSON") {
      setLocation(selected.location);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    if (!property || !buyer || !date || !time || !location.trim()) return;
    try {
      await schedule.mutateAsync({
        propertyId: property.id,
        buyerId: buyer.backendId,
        name: buyer.name,
        location: location.trim(),
        message: notes.trim(),
        meetingType,
        date,
        time,
      });
    } catch (mutationError) {
      setError(
        getApiErrorMessage(
          mutationError,
          "The backend could not schedule this inspection.",
        ),
      );
    }
  };

  const valid = Boolean(property && buyer && date && time && location.trim());

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] gap-0 overflow-hidden p-0 sm:max-w-[670px]">
        {schedule.isSuccess ? (
          <SuccessState buyerName={buyer?.name ?? "the buyer"} onClose={() => handleOpenChange(false)} />
        ) : (
          <form className="flex max-h-[calc(100dvh-1rem)] min-h-0 flex-col" onSubmit={submit}>
            <DialogHeader className="shrink-0 px-5 py-5 sm:px-8 sm:py-7">
              <DialogTitle className="pr-8 text-xl sm:text-2xl">Schedule Property Inspection</DialogTitle>
              <DialogDescription>
                Set up a new viewing appointment for a potential buyer.
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto border-y px-5 py-5 sm:px-8 sm:py-7">
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={submitted && !propertyId}>
                    <FieldLabel htmlFor="inspection-property">Select property</FieldLabel>
                    <Select value={propertyId} onValueChange={selectProperty}>
                      <SelectTrigger id="inspection-property" className="h-12 w-full" aria-invalid={submitted && !propertyId}>
                        <SelectValue placeholder="Choose a property" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" className="max-h-72">
                        <SelectGroup>
                          {propertyOptions.length === 0 && (
                            <SelectItem value="property-options-unavailable" disabled>
                              No properties are available
                            </SelectItem>
                          )}
                          {propertyOptions.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {submitted && !propertyId && <FieldError>Select a property.</FieldError>}
                  </Field>

                  <Field data-invalid={submitted && !buyerId}>
                    <FieldLabel htmlFor="inspection-buyer">Select buyer</FieldLabel>
                    <Select value={buyerId} onValueChange={setBuyerId}>
                      <SelectTrigger id="inspection-buyer" className="h-12 w-full" aria-invalid={submitted && !buyerId}>
                        <SelectValue placeholder="Choose a buyer" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" className="max-h-72">
                        <SelectGroup>
                          {buyers.length === 0 && (
                            <SelectItem value="buyer-options-unavailable" disabled>
                              No buyers are available
                            </SelectItem>
                          )}
                          {buyers.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}{item.email ? ` · ${item.email}` : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {submitted && !buyerId && <FieldError>Select a buyer.</FieldError>}
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={submitted && !date}>
                    <FieldLabel htmlFor="inspection-date">Date</FieldLabel>
                    <div className="relative">
                      <Input id="inspection-date" className="h-12 pr-10" type="date" min={today()} value={date} onChange={(event) => setDate(event.target.value)} aria-invalid={submitted && !date} />
                      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {submitted && !date && <FieldError>Select a date.</FieldError>}
                  </Field>
                  <Field data-invalid={submitted && !time}>
                    <FieldLabel htmlFor="inspection-time">Time</FieldLabel>
                    <div className="relative">
                      <Input id="inspection-time" className="h-12 pr-10" type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-invalid={submitted && !time} />
                      <Clock3 className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {submitted && !time && <FieldError>Select a time.</FieldError>}
                  </Field>
                </div>

                <FieldSet>
                  <FieldLegend variant="label">Inspection type</FieldLegend>
                  <ToggleGroup
                    type="single"
                    value={meetingType}
                    onValueChange={(value) => {
                      if (!value) return;
                      const nextType = value as "IN_PERSON" | "VIDEO_CALL";
                      setMeetingType(nextType);
                      if (nextType === "IN_PERSON" && property) {
                        setLocation(property.location);
                      } else if (nextType === "VIDEO_CALL") {
                        setLocation("");
                      }
                    }}
                    className="h-12 w-full sm:w-96"
                  >
                    <ToggleGroupItem value="IN_PERSON"><MapPin /> Physical Visit</ToggleGroupItem>
                    <ToggleGroupItem value="VIDEO_CALL"><Video /> Virtual Tour</ToggleGroupItem>
                  </ToggleGroup>
                </FieldSet>

                <Field data-invalid={submitted && !location.trim()}>
                  <FieldLabel htmlFor="inspection-location">
                    {meetingType === "VIDEO_CALL" ? "Meeting link" : "Location"}
                  </FieldLabel>
                  <div className="relative">
                    <Input id="inspection-location" className="h-12 pr-10" placeholder={meetingType === "VIDEO_CALL" ? "Paste the meeting link" : "Enter the inspection address"} value={location} onChange={(event) => setLocation(event.target.value)} aria-invalid={submitted && !location.trim()} />
                    <MapIcon className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {submitted && !location.trim() && <FieldError>Enter a location or meeting link.</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="inspection-notes">Additional notes</FieldLabel>
                  <Textarea id="inspection-notes" className="min-h-24 resize-none" placeholder="Any specific requirements or reminders for this visit..." value={notes} onChange={(event) => setNotes(event.target.value)} />
                </Field>

                {error && <FieldError>{error}</FieldError>}
              </FieldGroup>
            </div>

            <DialogFooter className="m-0 shrink-0 rounded-none px-5 py-4 sm:px-8 sm:py-6">
              <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={schedule.isPending}>Cancel</Button>
              <Button className="w-full sm:w-auto" type="submit" size="lg" disabled={schedule.isPending || (submitted && !valid)}>
                {schedule.isPending && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
                {schedule.isPending ? "Scheduling..." : "Schedule Inspection"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessState({ buyerName, onClose }: { buyerName: string; onClose: () => void }) {
  return (
    <div className="flex min-h-[min(530px,calc(100dvh-1rem))] flex-col items-center justify-center gap-6 overflow-y-auto px-5 py-12 text-center sm:gap-7 sm:px-8">
      <div className="flex size-24 items-center justify-center rounded-full border-[9px] border-success text-success sm:size-28 sm:border-[10px]">
        <Check className="size-12 stroke-[3] sm:size-14" />
      </div>
      <div className="flex flex-col gap-3">
        <DialogTitle className="text-2xl sm:text-3xl">Inspection Booked Successfully</DialogTitle>
        <DialogDescription className="mx-auto max-w-md text-base leading-7">
          You have successfully booked an inspection with <strong className="text-foreground">{buyerName}</strong>. They will be notified on their end.
        </DialogDescription>
      </div>
      <Button size="lg" onClick={onClose}>Close</Button>
    </div>
  );
}

function uniqueBuyers(inspections: VendorInspection[]): BuyerOption[] {
  const buyers = new Map<string, BuyerOption>();
  inspections.forEach((inspection) => {
    const id = inspection.userId ?? inspection.userEmail ?? inspection.userName;
    if (!buyers.has(id)) {
      buyers.set(id, {
        id,
        backendId: inspection.userId,
        name: inspection.userName,
        email: inspection.userEmail,
      });
    }
  });
  return [...buyers.values()];
}

function uniqueProperties(
  properties: PropertyApiItem[],
  inspections: VendorInspection[],
): PropertyOption[] {
  const options = new Map<string, PropertyOption>();
  properties.forEach((property) => {
    options.set(property.id, {
      id: property.id,
      name: property.name,
      location: [property.address, property.city, property.state]
        .filter(Boolean)
        .join(", "),
    });
  });
  inspections.forEach((inspection) => {
    if (!inspection.propertyId || options.has(inspection.propertyId)) return;
    options.set(inspection.propertyId, {
      id: inspection.propertyId,
      name: inspection.propertyName,
      location:
        inspection.location === "Location not provided" ? "" : inspection.location,
    });
  });
  return [...options.values()];
}

function today() {
  const current = new Date();
  const offset = current.getTimezoneOffset();
  return new Date(current.getTime() - offset * 60_000).toISOString().slice(0, 10);
}
