"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Coins,
  Crown,
  CreditCard,
  Gift,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useCalculateCreditPurchase,
  useBulkCreditQuotes,
  useCreditInfo,
  useCreditRules,
  useInitializeCreditPurchase,
  useVerifyCreditPurchase,
  creditPaymentKeys,
} from "@/features/vendor/hooks/use-credit-payment";
import {
  PENDING_CREDIT_BALANCE_KEY,
  PENDING_CREDIT_REFERENCE_KEY,
  type CreditInfo,
  type CreditPurchaseQuote,
} from "@/services/credit-payment.service";
import { getApiErrorMessage } from "@/services/api-error";
import { DEFAULT_CREDIT_SETTINGS } from "@/services/admin-credit.service";
import { cn } from "@/lib/utils";

const BULK_PACKAGES = [
  {
    name: "Starter",
    description: "A quick boost for occasional listings",
    points: 50,
    icon: Zap,
    popular: false,
  },
  {
    name: "Professional",
    description: "Best value for active property vendors",
    points: 150,
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Built for agencies with many properties",
    points: 500,
    icon: Crown,
    popular: false,
  },
] as const;

function formatMoney(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function paymentErrorMessage(error: unknown, fallback: string) {
  if (
    error instanceof Error &&
    !("isAxiosError" in error) &&
    error.message.trim()
  ) {
    return error.message;
  }
  return getApiErrorMessage(error, fallback);
}

export function CreditPointsPayment() {
  const queryClient = useQueryClient();
  const creditInfo = useCreditInfo();
  const creditRules = useCreditRules();
  const calculatePurchase = useCalculateCreditPurchase();
  const initializePurchase = useInitializeCreditPurchase();
  const minimumPoints =
    creditRules.data?.minimumPurchasePoints ??
    creditInfo.data?.minimumPurchasePoints ??
    10;
  const availablePackages = BULK_PACKAGES.filter(
    (item) => item.points >= minimumPoints,
  );
  const bulkQuotes = useBulkCreditQuotes(
    availablePackages.map((item) => item.points),
    !creditInfo.isPending,
  );
  const firstAvailableQuote = bulkQuotes.find(
    (packageQuote) => packageQuote.data,
  )?.data;
  const quotedPricePerPoint =
    firstAvailableQuote?.amount && firstAvailableQuote.points
      ? firstAvailableQuote.amount / firstAvailableQuote.points
      : null;
  const rules = {
    currency:
      creditRules.data?.currency ??
      creditInfo.data?.currency ??
      DEFAULT_CREDIT_SETTINGS.currency,
    pricePerPoint:
      creditRules.data?.pricePerPoint ??
      creditInfo.data?.pricePerPoint ??
      quotedPricePerPoint ??
      DEFAULT_CREDIT_SETTINGS.pricePerPoint,
    propertyCreationCost:
      creditRules.data?.propertyCreationCost ??
      creditInfo.data?.propertyCreationCost ??
      DEFAULT_CREDIT_SETTINGS.propertyCreationCost,
    featurePropertyCost:
      creditRules.data?.featurePropertyCost ??
      creditInfo.data?.featurePropertyCost ??
      DEFAULT_CREDIT_SETTINGS.featurePropertyCost,
    featurePropertyDurationDays:
      creditRules.data?.featurePropertyDurationDays ??
      creditInfo.data?.featurePropertyDurationDays ??
      DEFAULT_CREDIT_SETTINGS.featurePropertyDurationDays,
    newVendorBonusPoints:
      creditRules.data?.newVendorBonusPoints ??
      creditInfo.data?.newVendorBonusPoints ??
      DEFAULT_CREDIT_SETTINGS.newVendorBonusPoints,
    newVendorBonusExpiryDays:
      creditRules.data?.newVendorBonusExpiryDays ??
      creditInfo.data?.newVendorBonusExpiryDays ??
      DEFAULT_CREDIT_SETTINGS.newVendorBonusExpiryDays,
  };
  const [points, setPoints] = useState(String(minimumPoints));
  const [quote, setQuote] = useState<CreditPurchaseQuote | null>(null);
  const [purchasingPoints, setPurchasingPoints] = useState<number | null>(null);
  const [pendingReference] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem(PENDING_CREDIT_REFERENCE_KEY),
  );
  const pendingVerification = useVerifyCreditPurchase(pendingReference);

  useEffect(() => {
    if (pendingVerification.data?.state !== "success") return;
    sessionStorage.removeItem(PENDING_CREDIT_REFERENCE_KEY);
    if (pendingVerification.data.newBalance !== null) {
      queryClient.setQueryData<CreditInfo>(
        creditPaymentKeys.info,
        (current) => ({
          balance: pendingVerification.data!.newBalance,
          currency: current?.currency ?? pendingVerification.data!.currency,
          minimumPurchasePoints: current?.minimumPurchasePoints ?? null,
          pricePerPoint: current?.pricePerPoint ?? null,
          transactions: current?.transactions ?? [],
        }),
      );
    }
    void queryClient.invalidateQueries({ queryKey: creditPaymentKeys.info });
    toast.success("Your purchased credit points have been added.");
  }, [pendingVerification.data, queryClient]);

  function validPoints() {
    const parsed = Number(points);
    if (!Number.isInteger(parsed) || parsed < minimumPoints) {
      toast.error(`Enter at least ${minimumPoints} whole credit points.`);
      return null;
    }
    return parsed;
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = validPoints();
    if (parsed === null) return;

    calculatePurchase.mutate(parsed, {
      onSuccess: setQuote,
      onError: (error) =>
        toast.error(paymentErrorMessage(error, "Unable to calculate payment.")),
    });
  }

  function beginCheckout(selectedPoints: number) {
    setPurchasingPoints(selectedPoints);
    initializePurchase.mutate(selectedPoints, {
      onSuccess: (purchase) => {
        if (
          creditInfo.data?.balance !== null &&
          creditInfo.data?.balance !== undefined
        ) {
          sessionStorage.setItem(
            PENDING_CREDIT_BALANCE_KEY,
            String(creditInfo.data.balance),
          );
        }
        if (purchase.reference) {
          sessionStorage.setItem(
            PENDING_CREDIT_REFERENCE_KEY,
            purchase.reference,
          );
        }
        window.location.assign(purchase.authorizationUrl);
      },
      onError: (error) =>
        toast.error(paymentErrorMessage(error, "Unable to start Paystack.")),
      onSettled: () => setPurchasingPoints(null),
    });
  }

  function handlePay() {
    if (quote) beginCheckout(quote.points);
  }

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          Secure Paystack checkout
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Credit Points &amp; Payments
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Purchase credit points for property listings and featured placement.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Coins className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Available point balance
              </p>
              <p className="text-3xl font-semibold tracking-tight text-primary">
                {creditInfo.isPending ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  `${(creditInfo.data?.balance ?? 0).toLocaleString("en-NG")} points`
                )}
              </p>
            </div>
          </div>
          <p className="max-w-md text-sm text-muted-foreground sm:text-right">
            Use points for property listings and featured placement. Completed
            purchases are added after secure payment confirmation.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Choose a credit package
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Purchase a ready-made bundle or calculate a custom amount below.
          </p>
        </div>
        <div className="grid gap-5 pt-4 md:grid-cols-3">
          {availablePackages.map((item, index) => {
            const Icon = item.icon;
            const packageQuote = bulkQuotes[index];
            const pricePerPoint = packageQuote.data
              ? packageQuote.data.amount / packageQuote.data.points
              : null;
            const isPurchasing = purchasingPoints === item.points;

            return (
              <Card
                key={item.name}
                className={cn(
                  "relative overflow-visible",
                  item.popular && "border-primary shadow-md",
                )}
              >
                {item.popular && (
                  <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1">
                    Most popular
                  </Badge>
                )}
                <CardHeader className="items-center text-center">
                  <span className="grid size-12 place-items-center justify-self-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-2 text-center">
                  {packageQuote.isPending ? (
                    <Skeleton className="h-9 w-32" />
                  ) : packageQuote.data ? (
                    <p className="text-3xl font-bold">
                      {formatMoney(
                        packageQuote.data.amount,
                        packageQuote.data.currency,
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-destructive">
                      Price unavailable
                    </p>
                  )}
                  <p className="text-xl font-semibold text-primary">
                    {item.points.toLocaleString("en-NG")} credits
                  </p>
                  {pricePerPoint !== null && (
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(pricePerPoint, packageQuote.data?.currency)}{" "}
                      per credit
                    </p>
                  )}
                </CardContent>
                <CardFooter className="bg-transparent">
                  <Button
                    variant={item.popular ? "default" : "outline"}
                    className="w-full"
                    disabled={
                      !packageQuote.data || initializePurchase.isPending
                    }
                    onClick={() =>
                      packageQuote.data &&
                      beginCheckout(packageQuote.data.points)
                    }
                  >
                    {isPurchasing && <Spinner data-icon="inline-start" />}
                    {isPurchasing ? "Opening Paystack..." : "Buy package"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buy credit points</CardTitle>
            <CardDescription>
              Calculate the total before continuing to Paystack.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="credit-points">
                    Number of points
                  </FieldLabel>
                  <Input
                    id="credit-points"
                    type="number"
                    inputMode="numeric"
                    min={minimumPoints}
                    step={1}
                    value={points}
                    onChange={(event) => {
                      setPoints(event.target.value);
                      setQuote(null);
                    }}
                    disabled={
                      calculatePurchase.isPending ||
                      initializePurchase.isPending
                    }
                    className="h-12"
                  />
                  <FieldDescription>
                    Enter {minimumPoints.toLocaleString("en-NG")} points or
                    more.
                  </FieldDescription>
                </Field>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={
                    calculatePurchase.isPending || initializePurchase.isPending
                  }
                  className="h-11"
                >
                  {calculatePurchase.isPending && (
                    <Spinner data-icon="inline-start" />
                  )}
                  {calculatePurchase.isPending
                    ? "Calculating..."
                    : "Calculate total"}
                </Button>
              </FieldGroup>
            </form>

            {quote && (
              <div className="mt-6 rounded-xl bg-muted p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Credit points</span>
                  <span className="font-medium">
                    {quote.points.toLocaleString("en-NG")}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between gap-4 text-lg">
                  <span>Total payment</span>
                  <span className="font-semibold text-primary">
                    {formatMoney(quote.amount, quote.currency)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-3 bg-transparent">
            <Button
              size="lg"
              className="w-full"
              disabled={!quote || initializePurchase.isPending}
              onClick={handlePay}
            >
              {initializePurchase.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CreditCard data-icon="inline-start" />
              )}
              {initializePurchase.isPending
                ? "Opening Paystack..."
                : "Continue to Paystack"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Payment details are entered securely on Paystack. PropertyArk does
              not collect your card information.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit rules and pricing</CardTitle>
            <CardDescription>
              Live platform charges configured by the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Price per credit",
                value: formatMoney(rules.pricePerPoint, rules.currency),
                icon: WalletCards,
              },
              {
                label: "Minimum purchase",
                value: minimumPoints.toLocaleString("en-NG") + " points",
                icon: Coins,
              },
              {
                label: "Property listing",
                value:
                  rules.propertyCreationCost.toLocaleString("en-NG") +
                  " points",
                icon: Building2,
              },
              {
                label: "Featured placement",
                value:
                  rules.featurePropertyCost.toLocaleString("en-NG") + " points",
                icon: Sparkles,
              },
              {
                label: "Featured duration",
                value:
                  rules.featurePropertyDurationDays.toLocaleString("en-NG") +
                  " days",
                icon: CalendarDays,
              },
              {
                label: "New vendor bonus",
                value:
                  rules.newVendorBonusPoints.toLocaleString("en-NG") +
                  " points · " +
                  rules.newVendorBonusExpiryDays.toLocaleString("en-NG") +
                  " days",
                icon: Gift,
              },
            ].map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.label}
                  className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {rule.label}
                    </p>
                    <p className="font-medium">{rule.value}</p>
                  </div>
                </div>
              );
            })}
            <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4 sm:col-span-2">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                Purchases are credited only after secure backend payment
                confirmation. Admin pricing changes apply to future purchases
                and charges.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
