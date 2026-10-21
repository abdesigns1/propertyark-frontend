"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Clock3,
  CreditCard,
  DoorOpen,
  LogOut,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ShortletStayInformationProps {
  checkInTime?: string;
  checkOutTime?: string;
  houseRules: string[];
  cancellationPolicy?: string;
  paymentPolicy?: string;
}

const COLLAPSED_TEXT_LENGTH = 260;
const COLLAPSED_RULE_COUNT = 3;

function formatStayTime(value?: string) {
  if (!value?.trim()) return "Contact host";

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return value;

  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hours, minutes));
}

function ScheduleCard({
  label,
  time,
  description,
  icon: Icon,
}: {
  label: string;
  time?: string;
  description: string;
  icon: typeof DoorOpen;
}) {
  return (
    <Card size="sm" className="bg-muted/35 shadow-none">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3">
        <div className="row-span-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <Badge variant="outline">{label}</Badge>
        <CardTitle className="text-xl">{formatStayTime(time)}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function ExpandablePolicy({
  title,
  description,
  icon,
  shouldCollapse,
  collapsedContent,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  shouldCollapse: boolean;
  collapsedContent?: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card size="sm" className="shadow-none">
      <CardHeader className="grid-cols-[auto_1fr] items-start gap-x-3">
        <div className="row-span-2 flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="text-sm leading-6 text-muted-foreground">
            {shouldCollapse ? (
              <>
                {!isOpen ? collapsedContent : null}
                <CollapsibleContent>{children}</CollapsibleContent>
              </>
            ) : (
              children
            )}
          </div>

          {shouldCollapse ? (
            <CollapsibleTrigger asChild>
              <Button variant="link" size="sm" className="mt-2 px-0">
                {isOpen ? "View less" : "View more"}
                <ChevronDown
                  data-icon="inline-end"
                  className={cn("transition-transform", isOpen && "rotate-180")}
                />
              </Button>
            </CollapsibleTrigger>
          ) : null}
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function ShortletStayInformation({
  checkInTime,
  checkOutTime,
  houseRules,
  cancellationPolicy,
  paymentPolicy,
}: ShortletStayInformationProps) {
  const cancellation =
    cancellationPolicy?.trim() || "Contact the host for cancellation terms.";
  const payment =
    paymentPolicy?.trim() || "Payment terms will be confirmed before booking.";
  const rulesLength = houseRules.join(" ").length;
  const shouldCollapseRules =
    houseRules.length > COLLAPSED_RULE_COUNT ||
    rulesLength > COLLAPSED_TEXT_LENGTH;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/25">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 className="size-5" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-xl">
              Stay information and policies
            </CardTitle>
            <CardDescription>
              Plan your arrival and review the host&apos;s terms before booking.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <section aria-labelledby="arrival-schedule-heading">
          <div className="mb-4 flex flex-col gap-1">
            <h3 id="arrival-schedule-heading" className="font-semibold">
              Arrival schedule
            </h3>
            <p className="text-sm text-muted-foreground">
              Use these times when planning your trip to the property.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ScheduleCard
              label="Check-in"
              time={checkInTime}
              description="Your stay begins from this time."
              icon={DoorOpen}
            />
            <ScheduleCard
              label="Check-out"
              time={checkOutTime}
              description="Please complete departure by this time."
              icon={LogOut}
            />
          </div>
        </section>

        <Separator />

        <section aria-labelledby="stay-policies-heading">
          <div className="mb-4 flex flex-col gap-1">
            <h3 id="stay-policies-heading" className="font-semibold">
              Policies and expectations
            </h3>
            <p className="text-sm text-muted-foreground">
              Important guidance from the host for a smooth stay.
            </p>
          </div>

          <div className="grid items-start gap-4 md:grid-cols-2">
            <ExpandablePolicy
              title="House rules"
              description="What the host expects during your stay."
              icon={<ScrollText className="size-4" aria-hidden="true" />}
              shouldCollapse={shouldCollapseRules}
              collapsedContent={
                <ol className="flex max-h-36 list-decimal flex-col gap-2 overflow-hidden pl-5">
                  {houseRules
                    .slice(0, COLLAPSED_RULE_COUNT)
                    .map((rule, index) => (
                      <li key={`${index}-${rule}`}>{rule}</li>
                    ))}
                </ol>
              }
            >
              {houseRules.length ? (
                <ol className="flex list-decimal flex-col gap-2 pl-5">
                  {houseRules.map((rule, index) => (
                    <li key={`${index}-${rule}`}>{rule}</li>
                  ))}
                </ol>
              ) : (
                <p>No additional house rules supplied.</p>
              )}
            </ExpandablePolicy>

            <ExpandablePolicy
              title="Cancellation policy"
              description="Terms that apply if your plans change."
              icon={<ShieldCheck className="size-4" aria-hidden="true" />}
              shouldCollapse={cancellation.length > COLLAPSED_TEXT_LENGTH}
              collapsedContent={
                <p>{cancellation.slice(0, COLLAPSED_TEXT_LENGTH).trimEnd()}…</p>
              }
            >
              <p className="whitespace-pre-line">{cancellation}</p>
            </ExpandablePolicy>

            <ExpandablePolicy
              title="Payment policy"
              description="How payment for this stay is handled."
              icon={<CreditCard className="size-4" aria-hidden="true" />}
              shouldCollapse={payment.length > COLLAPSED_TEXT_LENGTH}
              collapsedContent={
                <p>{payment.slice(0, COLLAPSED_TEXT_LENGTH).trimEnd()}…</p>
              }
            >
              <p className="whitespace-pre-line">{payment}</p>
            </ExpandablePolicy>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
