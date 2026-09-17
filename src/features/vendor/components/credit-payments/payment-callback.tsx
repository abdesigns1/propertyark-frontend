"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleX,
  Clock3,
  Coins,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  creditPaymentKeys,
  useCreditInfo,
  useVerifyCreditPurchase,
} from "@/features/vendor/hooks/use-credit-payment";
import {
  PENDING_CREDIT_BALANCE_KEY,
  PENDING_CREDIT_REFERENCE_KEY,
  type CreditInfo,
} from "@/services/credit-payment.service";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CreditPaymentCallback() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const [startingBalance] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = Number(sessionStorage.getItem(PENDING_CREDIT_BALANCE_KEY));
    return Number.isFinite(stored) ? stored : null;
  });
  const verification = useVerifyCreditPurchase(reference);
  const wallet = useCreditInfo(verification.data?.state === "success");
  const walletData = wallet.data;
  const refetchWallet = wallet.refetch;

  useEffect(() => {
    if (verification.data?.state === "success") {
      sessionStorage.removeItem(PENDING_CREDIT_REFERENCE_KEY);
      if (verification.data.newBalance !== null) {
        queryClient.setQueryData<CreditInfo>(
          creditPaymentKeys.info,
          (current) => ({
            balance: verification.data!.newBalance,
            currency: current?.currency ?? verification.data!.currency,
            minimumPurchasePoints: current?.minimumPurchasePoints ?? null,
            pricePerPoint: current?.pricePerPoint ?? null,
            transactions: current?.transactions ?? [],
          }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: creditPaymentKeys.info });
    }
  }, [queryClient, verification.data]);

  useEffect(() => {
    if (
      verification.data?.state !== "success" ||
      verification.data.newBalance !== null
    )
      return;
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      void refetchWallet();
      if (attempts >= 10) window.clearInterval(interval);
    }, 3_000);
    return () => window.clearInterval(interval);
  }, [refetchWallet, verification.data?.newBalance, verification.data?.state]);

  if (!reference) {
    return (
      <CallbackShell>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText />
            </EmptyMedia>
            <EmptyTitle>Payment reference missing</EmptyTitle>
            <EmptyDescription>
              We could not identify the Paystack transaction. Return to the
              credit page and check your balance before trying again.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/vendor/subscription-rewards">
              Return to credit points
            </Link>
          </Button>
        </Empty>
      </CallbackShell>
    );
  }

  if (verification.isPending) {
    return (
      <CallbackShell>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Confirming your payment</EmptyTitle>
            <EmptyDescription>
              We are checking the transaction with Paystack. Please keep this
              page open.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CallbackShell>
    );
  }

  if (verification.isError) {
    return (
      <CallbackShell>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock3 />
            </EmptyMedia>
            <EmptyTitle>Confirmation is taking longer</EmptyTitle>
            <EmptyDescription>
              Paystack may still be notifying PropertyArk. Your account will
              only be credited after the backend webhook confirms payment.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => void verification.refetch()}>
            Check again
          </Button>
        </Empty>
      </CallbackShell>
    );
  }

  const purchase = verification.data!;
  const succeeded = purchase.state === "success";

  if (succeeded) {
    const displayedBalance = purchase.newBalance ?? walletData?.balance;
    const expectedBalance =
      purchase.points === null
        ? null
        : (startingBalance ?? 0) + purchase.points;
    const walletSynced =
      displayedBalance !== null &&
      displayedBalance !== undefined &&
      (purchase.newBalance !== null ||
        expectedBalance === null ||
        displayedBalance >= expectedBalance);

    return (
      <CallbackShell>
        <Card className="relative overflow-hidden border-success/20 bg-card shadow-[0_24px_70px_-32px_rgba(22,163,74,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-success/10 to-transparent" />
          <CardHeader className="relative items-center px-6 pb-2 pt-10 text-center sm:px-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.35, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 230, damping: 15 }}
              className="relative mx-auto mb-4 grid size-24 place-items-center self-center justify-self-center"
            >
              <motion.span
                initial={{ opacity: 0.55, scale: 0.7 }}
                animate={{ opacity: 0, scale: 1.55 }}
                transition={{ duration: 1.4, delay: 0.25, ease: "easeOut" }}
                className="absolute inset-2 rounded-full bg-success/25"
              />
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className="absolute inset-1 rounded-full border border-success/20 bg-success/10"
              />
              <span className="relative grid size-16 place-items-center rounded-full bg-success text-white shadow-lg shadow-success/25">
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.28, type: "spring", stiffness: 300 }}
                >
                  <Check className="size-9 stroke-[3]" aria-hidden="true" />
                </motion.span>
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <CardTitle className="text-3xl">Payment successful</CardTitle>
              <CardDescription className="mt-2 text-base">
                Your Paystack payment has been securely verified.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="relative space-y-5 px-6 py-6 sm:px-10">
            {purchase.points !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.35 }}
                className="flex items-center justify-center gap-3 rounded-2xl border border-success/15 bg-success/5 p-5"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-success/10 text-success">
                  <Coins className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Credit points purchased
                  </p>
                  <p className="text-2xl font-bold text-success">
                    +{purchase.points.toLocaleString("en-NG")} points
                  </p>
                </div>
              </motion.div>
            )}

            <div className="grid gap-3 rounded-2xl border bg-muted/35 p-5 sm:grid-cols-2">
              <Detail label="Reference" value={purchase.reference} />
              {purchase.purchaseNumber && (
                <Detail label="Purchase ID" value={purchase.purchaseNumber} />
              )}
              {purchase.amountPaid !== null && (
                <Detail
                  label="Amount paid"
                  value={formatMoney(purchase.amountPaid, purchase.currency)}
                />
              )}
              <Detail
                label="Wallet balance"
                value={
                  walletSynced
                    ? `${(displayedBalance ?? 0).toLocaleString("en-NG")} points`
                    : "Syncing…"
                }
              />
            </div>

            {!walletSynced && (
              <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm">
                <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin text-warning" />
                <div>
                  <p className="font-medium">Wallet balance is syncing</p>
                  <p className="mt-1 text-muted-foreground">
                    Payment is verified, but the backend has not returned the
                    updated credit balance yet. We will keep checking
                    automatically.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" />
              Secured and verified by Paystack
            </div>
          </CardContent>

          <CardFooter className="relative flex-col gap-3 border-0 bg-transparent px-6 pb-8 pt-0 sm:px-10">
            {!walletSynced && (
              <Button
                variant="outline"
                className="w-full"
                disabled={wallet.isFetching}
                onClick={() => {
                  void verification.refetch();
                  void refetchWallet();
                }}
              >
                <RefreshCw
                  className={wallet.isFetching ? "animate-spin" : ""}
                />
                Check wallet balance
              </Button>
            )}
            <Button asChild className="w-full">
              <Link href="/vendor/subscription-rewards">
                Go to credit points <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </CallbackShell>
    );
  }

  return (
    <CallbackShell>
      <Card>
        <CardHeader className="items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            {purchase.state === "failed" ? (
              <CircleX className="size-8 text-destructive" aria-hidden="true" />
            ) : (
              <Clock3 className="size-8 text-warning" aria-hidden="true" />
            )}
          </span>
          <CardTitle className="text-2xl">
            {succeeded
              ? "Payment successful"
              : purchase.state === "failed"
                ? "Payment unsuccessful"
                : "Payment pending"}
          </CardTitle>
          <CardDescription>{purchase.message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 rounded-xl bg-muted p-4">
          <Detail label="Reference" value={purchase.reference} />
          {purchase.purchaseNumber && (
            <Detail label="Purchase" value={purchase.purchaseNumber} />
          )}
          {purchase.points !== null && (
            <Detail
              label="Credit points"
              value={purchase.points.toLocaleString("en-NG")}
            />
          )}
          {purchase.amountPaid !== null && (
            <Detail
              label="Amount paid"
              value={formatMoney(purchase.amountPaid, purchase.currency)}
            />
          )}
          {purchase.newBalance !== null && (
            <Detail
              label="New balance"
              value={`${purchase.newBalance.toLocaleString("en-NG")} points`}
            />
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3 bg-transparent">
          {purchase.state === "pending" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void verification.refetch()}
            >
              Check payment again
            </Button>
          )}
          <Button asChild className="w-full">
            <Link href="/vendor/subscription-rewards">
              Return to credit points
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </CallbackShell>
  );
}

function CallbackShell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-xl py-8">{children}</section>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium">{value}</span>
    </div>
  );
}
