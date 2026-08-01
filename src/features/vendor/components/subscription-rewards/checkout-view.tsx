import { Check, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

import { CURRENCY_FORMATTER, PAYMENT_OPTIONS } from "./data";
import { SubscriptionPageHeading } from "./shared";
import type { SubscriptionPlan } from "./types";

interface CheckoutViewProps {
  fullName: string;
  email: string;
  plan: SubscriptionPlan;
  paymentMethod: string;
  confirmedBilling: boolean;
  acceptedTerms: boolean;
  onPaymentMethod: (value: string) => void;
  onConfirmedBilling: (value: boolean) => void;
  onAcceptedTerms: (value: boolean) => void;
  onPay: () => void;
  onBack: () => void;
}

export function CheckoutView({
  fullName,
  email,
  plan,
  paymentMethod,
  confirmedBilling,
  acceptedTerms,
  onPaymentMethod,
  onConfirmedBilling,
  onAcceptedTerms,
  onPay,
  onBack,
}: CheckoutViewProps) {
  const price = plan.price ?? 0;

  return (
    <>
      <SubscriptionPageHeading
        title="Complete Your Subscription"
        description="Scale your shortlet management with professional vendor tools."
        actions={
          <Button variant="outline" onClick={onBack}>
            Back to plans
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <BillingInformation fullName={fullName} email={email} />
          <PaymentMethods
            value={paymentMethod}
            onValueChange={onPaymentMethod}
          />
          <CheckoutConfirmations
            confirmedBilling={confirmedBilling}
            acceptedTerms={acceptedTerms}
            onConfirmedBilling={onConfirmedBilling}
            onAcceptedTerms={onAcceptedTerms}
          />
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <SelectedPlanSummary plan={plan} price={price} />
          <PaymentSummary price={price} onPay={onPay} />
        </div>
      </div>
    </>
  );
}

function BillingInformation({
  fullName,
  email,
}: Pick<CheckoutViewProps, "fullName" | "email">) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <StepBadge step={1} /> Billing Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="billing-name">Full Name</FieldLabel>
              <Input id="billing-name" defaultValue={fullName} />
            </Field>
            <Field>
              <FieldLabel htmlFor="business-name">Business Name</FieldLabel>
              <Input
                id="business-name"
                placeholder="Your registered business"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="billing-email">Email Address</FieldLabel>
            <Input id="billing-email" type="email" defaultValue={email} />
          </Field>
          <Field>
            <FieldLabel htmlFor="billing-address">Billing Address</FieldLabel>
            <Input
              id="billing-address"
              placeholder="Enter your complete billing address"
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function PaymentMethods({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <StepBadge step={2} /> Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          value={value}
          onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}
          className="h-auto w-full flex-col bg-transparent p-0"
        >
          {PAYMENT_OPTIONS.map(({ id, label, description, icon: Icon }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              className="h-auto w-full justify-start rounded-lg border p-4 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"
            >
              <Icon className="size-6 text-primary" />
              <span className="flex flex-1 flex-col items-start">
                <span className="font-semibold text-foreground">{label}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {description}
                </span>
              </span>
              <span className="size-5 rounded-full border data-[state=on]:border-primary" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}

function CheckoutConfirmations({
  confirmedBilling,
  acceptedTerms,
  onConfirmedBilling,
  onAcceptedTerms,
}: Pick<
  CheckoutViewProps,
  | "confirmedBilling"
  | "acceptedTerms"
  | "onConfirmedBilling"
  | "onAcceptedTerms"
>) {
  return (
    <FieldSet className="px-2">
      <FieldLegend className="sr-only">Checkout confirmations</FieldLegend>
      <Field orientation="horizontal">
        <Checkbox
          id="billing-confirm"
          checked={confirmedBilling}
          onCheckedChange={(checked) => onConfirmedBilling(checked === true)}
        />
        <FieldLabel htmlFor="billing-confirm">
          I confirm my billing information is accurate and matches my
          identification.
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox
          id="terms-confirm"
          checked={acceptedTerms}
          onCheckedChange={(checked) => onAcceptedTerms(checked === true)}
        />
        <FieldLabel htmlFor="terms-confirm">
          I agree to PropertyArk subscription terms and privacy policy regarding
          automatic renewals.
        </FieldLabel>
      </Field>
    </FieldSet>
  );
}

function SelectedPlanSummary({
  plan,
  price,
}: {
  plan: SubscriptionPlan;
  price: number;
}) {
  return (
    <Card className="bg-primary text-primary-foreground ring-primary">
      <CardHeader>
        <CardDescription className="text-primary-foreground/80">
          {plan.name} Vendor
        </CardDescription>
        <CardAction className="text-right">
          <p className="font-heading text-2xl font-semibold">
            {CURRENCY_FORMATTER.format(price)}
          </p>
          <p className="text-xs text-primary-foreground/70">per month</p>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan.features.slice(0, 4).map((feature) => (
          <div key={feature} className="flex gap-2">
            <Check className="size-4 text-accent" />
            <span>{feature}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-primary-foreground/15 bg-primary-foreground/5">
        <div className="flex w-full justify-between">
          <span className="uppercase tracking-wide text-primary-foreground/70">
            Next billing
          </span>
          <span className="font-semibold">Aug 31, 2026</span>
        </div>
      </CardFooter>
    </Card>
  );
}

function PaymentSummary({ price, onPay }: { price: number; onPay: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="uppercase tracking-wider text-muted-foreground">
          Payment summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SummaryLine label="Subscription fee" value={price} />
        <SummaryLine label="VAT (0%)" value={0} />
        <Separator />
        <div className="flex justify-between text-lg">
          <span>Total</span>
          <span className="font-heading font-semibold text-primary">
            {CURRENCY_FORMATTER.format(price)}
          </span>
        </div>
        <Button size="lg" onClick={onPay}>
          Pay {CURRENCY_FORMATTER.format(price)}
        </Button>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          PCI-DSS compliant infrastructure
        </div>
        <FieldDescription className="text-center">
          Preview checkout only. No charge will be made until the subscription
          API is connected.
        </FieldDescription>
      </CardContent>
    </Card>
  );
}

function StepBadge({ step }: { step: number }) {
  return (
    <Badge className="size-8 rounded-full bg-accent text-accent-foreground">
      {step}
    </Badge>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium">{CURRENCY_FORMATTER.format(value)}</span>
    </div>
  );
}
