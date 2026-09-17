"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  History,
  ReceiptText,
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreditInfo } from "@/features/vendor/hooks/use-credit-payment";
import type {
  CreditTransaction,
  CreditTransactionStatus,
} from "@/services/credit-payment.service";

function formatMoney(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const statusLabels: Record<CreditTransactionStatus, string> = {
  success: "Completed",
  pending: "Pending",
  failed: "Failed",
};

function StatusBadge({ status }: { status: CreditTransactionStatus }) {
  return (
    <Badge
      variant={status === "success" ? "secondary" : "outline"}
      className={
        status === "failed"
          ? "border-destructive/30 text-destructive"
          : undefined
      }
    >
      {statusLabels[status]}
    </Badge>
  );
}

function TransactionIcon({ transaction }: { transaction: CreditTransaction }) {
  const isUsage = transaction.points < 0 || transaction.kind === "usage";
  return (
    <span
      className={
        isUsage
          ? "flex size-9 items-center justify-center rounded-full bg-orange-50 text-orange-600"
          : "flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
      }
    >
      {isUsage ? (
        <ArrowUpRight className="size-4" />
      ) : (
        <ArrowDownLeft className="size-4" />
      )}
    </span>
  );
}

export function CreditTransactionHistory() {
  const creditInfo = useCreditInfo();
  const transactions = creditInfo.data?.transactions ?? [];
  const purchased = transactions.reduce(
    (total, item) => total + (item.kind === "purchase" ? Math.max(item.points, 0) : 0),
    0,
  );
  const used = transactions.reduce(
    (total, item) => total + (item.points < 0 ? Math.abs(item.points) : 0),
    0,
  );

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-secondary">Credit activity</p>
          <h1 className="text-3xl font-semibold tracking-tight">Transaction History</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Track credit purchases and every service paid for with your points.
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/subscription-rewards">
            <Coins /> Buy credit points
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current balance</CardDescription>
            <CardTitle className="text-2xl text-primary">
              {creditInfo.isPending ? <Skeleton className="h-8 w-24" /> : `${(creditInfo.data?.balance ?? 0).toLocaleString("en-NG")} points`}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credits purchased</CardDescription>
            <CardTitle className="text-2xl">{purchased.toLocaleString("en-NG")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credits used</CardDescription>
            <CardTitle className="text-2xl">{used.toLocaleString("en-NG")}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ReceiptText className="size-5 text-primary" /> Credit transactions
          </CardTitle>
          <CardDescription>Purchases, listing payments, featured placements, and adjustments.</CardDescription>
        </CardHeader>
        <CardContent>
          {creditInfo.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : creditInfo.isError ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><History /></EmptyMedia>
                <EmptyTitle>Could not load transactions</EmptyTitle>
                <EmptyDescription>Check your connection and try loading the history again.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button variant="outline" onClick={() => creditInfo.refetch()}>Try again</Button></EmptyContent>
            </Empty>
          ) : transactions.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><History /></EmptyMedia>
                <EmptyTitle>No credit transactions yet</EmptyTitle>
                <EmptyDescription>Your credit purchases and point usage will appear here.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button asChild><Link href="/vendor/subscription-rewards">Buy your first credits</Link></Button></EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <TransactionIcon transaction={transaction} />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="capitalize text-xs text-muted-foreground">{transaction.kind}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell className="max-w-40 truncate font-mono text-xs">{transaction.reference ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={transaction.status} /></TableCell>
                    <TableCell className="text-right">{formatMoney(transaction.amount, transaction.currency)}</TableCell>
                    <TableCell className={transaction.points < 0 ? "text-right font-semibold text-orange-600" : "text-right font-semibold text-emerald-600"}>
                      {transaction.points > 0 ? "+" : ""}{transaction.points.toLocaleString("en-NG")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
