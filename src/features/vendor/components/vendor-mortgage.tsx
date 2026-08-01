"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Download,
  Info,
  RotateCcw,
  Share2,
  SquareChartGantt,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  calculateMortgage,
  DEFAULT_MORTGAGE_VALUES,
  formatMortgageInput,
  formatNaira,
  formatPercent,
  frequencyLabel,
  parseMortgageInput,
  termDisplayValue,
  termSliderValue,
  termSummary,
  type MortgageValues,
  type PaymentFrequency,
} from "@/features/vendor/lib/mortgage-calculator";

export function MortgageCalculator() {
  const [draft, setDraft] = useState(DEFAULT_MORTGAGE_VALUES);
  const [calculated, setCalculated] = useState(DEFAULT_MORTGAGE_VALUES);
  const [submitted, setSubmitted] = useState(false);
  const result = useMemo(() => calculateMortgage(calculated), [calculated]);
  const downPaymentPercent = draft.propertyPrice
    ? Math.min(100, (draft.downPayment / draft.propertyPrice) * 100)
    : 0;
  const invalidPrice = draft.propertyPrice <= 0;
  const invalidDownPayment =
    draft.downPayment < 0 || draft.downPayment >= draft.propertyPrice;
  const invalidRate = draft.annualRate < 0 || draft.annualRate > 100;
  const invalidIncome = draft.householdIncome <= 0;

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (invalidPrice || invalidDownPayment || invalidRate || invalidIncome) return;
    setCalculated(draft);
    toast.success("Mortgage estimate updated.");
  };

  const reset = () => {
    setDraft(DEFAULT_MORTGAGE_VALUES);
    setCalculated(DEFAULT_MORTGAGE_VALUES);
    setSubmitted(false);
  };

  const share = async () => {
    const summary = `PropertyArk mortgage estimate: ${formatNaira(result.payment)} ${frequencyLabel(calculated.frequency).toLowerCase()} for a ${formatNaira(result.loanAmount)} loan.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "PropertyArk Mortgage Estimate", text: summary, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${summary} ${window.location.href}`);
        toast.success("Estimate copied to your clipboard.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("The estimate could not be shared.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-7 pb-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Mortgage Calculator</h1>
            <Badge variant="secondary">Estimate only</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-base leading-6 text-muted-foreground">
            Estimate your mortgage repayment and understand the total cost of financing a property based on the values you provide.
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button variant="outline" size="lg" onClick={share}>
            <Share2 data-icon="inline-start" /> Share Estimate
          </Button>
          <Button size="lg" onClick={() => window.print()}>
            <Download data-icon="inline-start" /> Export PDF
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.95fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Enter Mortgage Details</CardTitle>
              <CardDescription>Adjust the values below to create your estimate.</CardDescription>
            </div>
            <Info className="size-5 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <form id="mortgage-form" onSubmit={calculate}>
              <FieldGroup>
                <Field data-invalid={submitted && invalidPrice}>
                  <FieldLabel htmlFor="property-price">Property Price (₦)</FieldLabel>
                  <InputGroup className="h-14">
                    <InputGroupAddon><InputGroupText>₦</InputGroupText></InputGroupAddon>
                    <InputGroupInput
                      id="property-price"
                      inputMode="numeric"
                      className="font-numeric text-xl font-semibold"
                      value={formatMortgageInput(draft.propertyPrice)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          propertyPrice: parseMortgageInput(event.target.value),
                        }))
                      }
                      aria-invalid={submitted && invalidPrice}
                    />
                  </InputGroup>
                  {submitted && invalidPrice && <FieldError>Enter a property price greater than zero.</FieldError>}
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={submitted && invalidDownPayment}>
                    <FieldLabel htmlFor="down-payment">Down Payment (₦)</FieldLabel>
                    <InputGroup className="h-12">
                      <InputGroupInput
                        id="down-payment"
                        inputMode="numeric"
                        value={formatMortgageInput(draft.downPayment)}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            downPayment: parseMortgageInput(event.target.value),
                          }))
                        }
                        aria-invalid={submitted && invalidDownPayment}
                      />
                    </InputGroup>
                    <FieldDescription className="font-medium text-primary">
                      {formatPercent(downPaymentPercent)} of the property price
                    </FieldDescription>
                    {submitted && invalidDownPayment && <FieldError>Down payment must be less than the property price.</FieldError>}
                  </Field>

                  <Field data-invalid={submitted && invalidRate}>
                    <FieldLabel htmlFor="interest-rate">Interest Rate (%)</FieldLabel>
                    <InputGroup className="h-12">
                      <InputGroupInput
                        id="interest-rate"
                        inputMode="decimal"
                        value={draft.annualRate}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            annualRate: Number(event.target.value) || 0,
                          }))
                        }
                        aria-invalid={submitted && invalidRate}
                      />
                      <InputGroupAddon align="inline-end"><InputGroupText>%</InputGroupText></InputGroupAddon>
                    </InputGroup>
                    {submitted && invalidRate && <FieldError>Enter an interest rate between 0% and 100%.</FieldError>}
                  </Field>
                </div>

                <FieldSet>
                  <FieldLegend variant="label">Payment Frequency</FieldLegend>
                  <ToggleGroup
                    type="single"
                    value={draft.frequency}
                    onValueChange={(value) => {
                      if (!value) return;
                      const frequency = value as PaymentFrequency;
                      setDraft((current) => ({
                        ...current,
                        frequency,
                        termMonths:
                          frequency === "monthly"
                            ? current.termMonths
                            : Math.max(
                                12,
                                Math.round(current.termMonths / 12) * 12,
                              ),
                      }));
                    }}
                    className="h-12 w-full"
                  >
                    <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
                    <ToggleGroupItem value="quarterly">Quarterly</ToggleGroupItem>
                    <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
                  </ToggleGroup>
                </FieldSet>

                <Field>
                  <FieldLabel id="loan-term-label">Loan Term</FieldLabel>
                  <div className="rounded-xl border border-input px-5 pt-5 pb-4">
                    <p className="mb-5 text-2xl text-muted-foreground">
                      <strong className="font-normal tabular-nums text-foreground">
                        {termDisplayValue(draft)}
                      </strong>{" "}
                      {draft.frequency === "monthly" ? "months" : "years"}
                    </p>
                    <Slider
                      aria-labelledby="loan-term-label"
                      value={[termSliderValue(draft)]}
                      min={draft.frequency === "monthly" ? 12 : 1}
                      max={draft.frequency === "monthly" ? 360 : 30}
                      step={1}
                      onValueChange={([value]) =>
                        setDraft((current) => ({
                          ...current,
                          termMonths:
                            current.frequency === "monthly" ? value : value * 12,
                        }))
                      }
                      className="[&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-track]]:h-2"
                    />
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>{draft.frequency === "monthly" ? "12 months" : "1 year"}</span>
                      <span>{draft.frequency === "monthly" ? "360 months" : "30 years"}</span>
                    </div>
                  </div>
                </Field>

                <Field data-invalid={submitted && invalidIncome}>
                  <FieldLabel htmlFor="household-income">
                    Monthly Household Income (₦)
                  </FieldLabel>
                  <InputGroup className="h-12">
                    <InputGroupAddon>
                      <InputGroupText>₦</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="household-income"
                      inputMode="numeric"
                      value={formatMortgageInput(draft.householdIncome)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          householdIncome: parseMortgageInput(event.target.value),
                        }))
                      }
                      aria-invalid={submitted && invalidIncome}
                    />
                  </InputGroup>
                  <FieldDescription>
                    Used only to estimate the proportion of income required for repayment.
                  </FieldDescription>
                  {submitted && invalidIncome && (
                    <FieldError>Enter a monthly household income greater than zero.</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-3 sm:flex-row">
            <Button form="mortgage-form" type="submit" size="lg" className="w-full">
              Calculate Mortgage
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={reset} className="w-full sm:w-auto">
              <RotateCcw data-icon="inline-start" /> Reset
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-5">
          <PaymentSummary values={calculated} result={result} />
          <CostBreakdown values={calculated} result={result} />
          <Card className="border-0 bg-primary/10 py-6 shadow-none">
            <CardContent className="flex items-start gap-4 px-6">
              <SquareChartGantt className="mt-0.5 size-6 shrink-0 text-primary" />
              <div className="flex flex-col gap-2">
                <p className="text-base leading-6">
                  Based on this estimate, your monthly repayment would be approximately{" "}
                  <strong className="font-medium text-primary">
                    {formatPercent(
                      (result.monthlyEquivalent / calculated.householdIncome) * 100,
                    )}
                  </strong>{" "}
                  of a {formatNaira(calculated.householdIncome)} monthly household income.
                </p>
                <p className="text-sm text-muted-foreground">
                  Recommended: Keep mortgage under 33%.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 bg-primary py-8 text-primary-foreground shadow-lg">
            <span
              className="pointer-events-none absolute -right-5 -bottom-14 rotate-12 text-[10rem] font-semibold leading-none text-primary-foreground/10"
              aria-hidden="true"
            >
              ?
            </span>
            <CardHeader className="gap-4 px-7">
              <CardTitle className="text-3xl">Need more information?</CardTitle>
              <CardDescription className="max-w-md text-base leading-6 text-primary-foreground/85">
                Learn about eligibility, required documentation, and PropertyArk&apos;s network of professional mortgage brokers.
              </CardDescription>
            </CardHeader>
            <CardFooter className="px-7">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 bg-background px-5 text-base text-primary hover:bg-background/90 hover:text-primary"
              >
                <Link href="/professional-services?service=mortgage-broker">
                  Get More Information <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Separator />
      <footer className="mx-auto max-w-4xl text-center text-sm leading-6 text-muted-foreground">
        <p>
          Disclaimer: This mortgage calculator is for illustrative purposes only and provides estimated values. Actual mortgage rates, repayments, and eligibility are determined by financial institutions following a formal assessment. PropertyArk is not a lender and does not guarantee these projections.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} PropertyArk. All rights reserved.</p>
      </footer>
    </div>
  );
}

function PaymentSummary({
  values,
  result,
}: {
  values: MortgageValues;
  result: ReturnType<typeof calculateMortgage>;
}) {
  return (
    <Card className="overflow-hidden bg-primary text-primary-foreground">
      <CardHeader>
        <CardDescription className="font-medium uppercase tracking-[0.18em] text-primary-foreground/75">
          Estimated {frequencyLabel(values.frequency)} Payment
        </CardDescription>
        <CardTitle className="text-4xl font-normal tabular-nums sm:text-5xl">
          {formatNaira(result.payment)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Separator className="mb-5 bg-primary-foreground/20" />
        <dl className="flex flex-col gap-3 text-sm">
          <SummaryRow label="Loan Amount" value={formatNaira(result.loanAmount)} />
          <SummaryRow label="Down Payment" value={formatNaira(values.downPayment)} />
          <SummaryRow
            label="Interest Rate / Term"
            value={`${values.annualRate}% / ${termSummary(values)}`}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function CostBreakdown({
  values,
  result,
}: {
  values: MortgageValues;
  result: ReturnType<typeof calculateMortgage>;
}) {
  const totalCost = values.downPayment + result.loanAmount + result.totalInterest;
  const down = totalCost ? (values.downPayment / totalCost) * 100 : 0;
  const principal = totalCost ? (result.loanAmount / totalCost) * 100 : 0;
  const interest = Math.max(0, 100 - down - principal);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base uppercase">Cost Breakdown</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex h-8 overflow-hidden rounded-full bg-muted" aria-label="Mortgage cost breakdown">
          <span className="bg-secondary" style={{ width: `${down}%` }} />
          <span className="bg-primary" style={{ width: `${principal}%` }} />
          <span className="bg-primary/40" style={{ width: `${interest}%` }} />
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <Legend color="bg-secondary" label={`Down: ${formatPercent(down)}`} />
          <Legend color="bg-primary" label={`Principal: ${formatPercent(principal)}`} />
          <Legend color="bg-primary/40" label={`Interest: ${formatPercent(interest)}`} />
        </div>
        <Separator />
        <dl className="flex flex-col gap-4">
          <SummaryRow label="Total Interest" value={formatNaira(result.totalInterest)} />
          <SummaryRow label="Total Repayment" value={formatNaira(result.totalRepayment)} emphasis />
        </dl>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="opacity-75">{label}</dt>
      <dd className={emphasis ? "font-bold tabular-nums text-primary" : "font-semibold tabular-nums"}>{value}</dd>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
