"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Coins, CreditCard, ShieldCheck, WalletCards } from "lucide-react";
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
  useCreditInfo,
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
  const calculatePurchase = useCalculateCreditPurchase();
  const initializePurchase = useInitializeCreditPurchase();
  const minimumPoints = creditInfo.data?.minimumPurchasePoints ?? 10;
  const [points, setPoints] = useState(String(minimumPoints));
  const [quote, setQuote] = useState<CreditPurchaseQuote | null>(null);
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

  function handlePay() {
    if (!quote) return;
    initializePurchase.mutate(quote.points, {
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
    });
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
          Your balance is updated after Paystack confirms the payment.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardDescription>Available balance</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {creditInfo.isPending ? (
                <Skeleton className="h-9 w-32" />
              ) : creditInfo.data?.balance !== null &&
                creditInfo.data?.balance !== undefined ? (
                `${creditInfo.data.balance.toLocaleString("en-NG")} points`
              ) : (
                "0 points"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Separator />
            <div className="flex items-start gap-3">
              <Coins
                className="mt-0.5 size-5 text-secondary"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">Flexible credit purchases</p>
                <p className="text-sm text-muted-foreground">
                  Minimum purchase: {minimumPoints.toLocaleString("en-NG")}{" "}
                  points
                </p>
              </div>
            </div>
            {creditInfo.data?.pricePerPoint !== null &&
              creditInfo.data?.pricePerPoint !== undefined && (
                <div className="flex items-start gap-3">
                  <WalletCards
                    className="mt-0.5 size-5 text-secondary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium">Current price</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(
                        creditInfo.data.pricePerPoint,
                        creditInfo.data.currency,
                      )}{" "}
                      per point
                    </p>
                  </div>
                </div>
              )}
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 text-secondary"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">Webhook protected</p>
                <p className="text-sm text-muted-foreground">
                  Points are credited only after secure backend confirmation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </section>
  );
}
