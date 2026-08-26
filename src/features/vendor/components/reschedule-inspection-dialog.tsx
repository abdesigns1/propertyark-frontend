"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarClock,
  CalendarDays,
  Clock3,
  LoaderCircle,
} from "lucide-react";
import { AnimatedDialogIcon } from "@/components/animated-dialog-icon";
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
import { Textarea } from "@/components/ui/textarea";
import { useRescheduleInspection } from "@/features/vendor/hooks/use-vendor-inspections";
import {
  formatInspectionTime,
  formatShortDate,
} from "@/features/vendor/lib/inspection-display";
import type { VendorInspection } from "@/services/inspection.service";

export function RescheduleInspectionDialog({
  inspection,
  onOpenChange,
}: {
  inspection: VendorInspection | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useRescheduleInspection();
  const initialAppointment = inspection
    ? new Date(inspection.inspectionDate)
    : null;
  const [date, setDate] = useState(() =>
    initialAppointment && !Number.isNaN(initialAppointment.getTime())
      ? localDateValue(initialAppointment)
      : "",
  );
  const [time, setTime] = useState(
    () =>
      inspection?.time?.slice(0, 5) ||
      (initialAppointment && !Number.isNaN(initialAppointment.getTime())
        ? localTimeValue(initialAppointment)
        : ""),
  );
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const close = () => {
    if (!mutation.isPending) onOpenChange(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!inspection || !date || !time) return;

    const nextDate = new Date(`${date}T${time}`);
    if (Number.isNaN(nextDate.getTime()) || nextDate.getTime() <= Date.now()) {
      return;
    }

    await mutation.mutateAsync({
      inspectionId: inspection.id,
      scheduledDate: nextDate.toISOString(),
      reason,
    });
    onOpenChange(false);
  };

  const scheduledDate = date && time ? new Date(`${date}T${time}`) : null;
  const invalidSchedule =
    submitted &&
    (!scheduledDate ||
      Number.isNaN(scheduledDate.getTime()) ||
      scheduledDate.getTime() <= openedAt);

  return (
    <Dialog open={Boolean(inspection)} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader className="items-center gap-4 px-6 pb-5 pt-8 text-center sm:text-center">
            <AnimatedDialogIcon
              icon={CalendarClock}
              tone="warning"
              size="large"
            />
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-2xl">
                Reschedule inspection
              </DialogTitle>
              <DialogDescription className="max-w-sm leading-6">
                Choose a new date and time for {inspection?.propertyName}. The
                buyer will be notified when the change is saved.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="border-y px-6 py-5">
            <div className="mb-5 rounded-xl bg-muted/60 p-4 text-sm">
              <p className="font-semibold">Current appointment</p>
              <p className="mt-1 text-muted-foreground">
                {inspection
                  ? `${formatShortDate(inspection.inspectionDate)} · ${formatInspectionTime(inspection)}`
                  : "Not available"}
              </p>
            </div>

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={submitted && !date}>
                  <FieldLabel htmlFor="reschedule-inspection-date">
                    New date
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="reschedule-inspection-date"
                      type="date"
                      min={localDateValue(new Date())}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      aria-invalid={submitted && !date}
                      className="pr-10"
                    />
                    <CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {submitted && !date && (
                    <FieldError>Select the new date.</FieldError>
                  )}
                </Field>

                <Field data-invalid={submitted && !time}>
                  <FieldLabel htmlFor="reschedule-inspection-time">
                    New time
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="reschedule-inspection-time"
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      aria-invalid={submitted && !time}
                      className="pr-10"
                    />
                    <Clock3 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {submitted && !time && (
                    <FieldError>Select the new time.</FieldError>
                  )}
                </Field>
              </div>

              {invalidSchedule && date && time && (
                <FieldError>
                  The new appointment must be in the future.
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="reschedule-inspection-reason">
                  Reason for rescheduling (optional)
                </FieldLabel>
                <Textarea
                  id="reschedule-inspection-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Let the buyer know why the appointment changed."
                  maxLength={500}
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 bg-muted/30 p-5 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={close}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <CalendarClock data-icon="inline-start" />
              )}
              {mutation.isPending ? "Rescheduling..." : "Save New Time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function localTimeValue(date: Date) {
  return [date.getHours(), date.getMinutes()]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
