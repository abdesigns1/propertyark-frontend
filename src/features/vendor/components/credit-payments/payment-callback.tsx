"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleX, Clock3, ReceiptText } from "lucide-react";
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
  useVerifyCreditPurchase,
} from "@/features/vendor/hooks/use-credit-payment";
import {
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
  const verification = useVerifyCreditPurchase(reference);

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

  return (
    <CallbackShell>
      <Card>
        <CardHeader className="items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            {succeeded ? (
              <CheckCircle2
                className="size-8 text-success"
                aria-hidden="true"
              />
            ) : purchase.state === "failed" ? (
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
