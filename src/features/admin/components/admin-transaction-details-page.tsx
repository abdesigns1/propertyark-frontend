"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Coins,
  CreditCard,
  Hash,
  Mail,
  UserRound,
  WalletCards,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  date,
  money,
  transactionFrom,
} from "@/features/admin/components/admin-transactions-page";
import { useAdminActivity } from "@/features/admin/hooks/use-admin-activity";
import { useAdminCreditSettings } from "@/features/admin/hooks/use-admin-credit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CREDIT_SETTINGS } from "@/services/admin-credit.service";

const SENSITIVE_KEY = /token|password|secret|authorization|cookie/i;

export function AdminTransactionDetailsPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const activityQuery = useAdminActivity(transactionId);
  const settingsQuery = useAdminCreditSettings();
  const pricePerPoint =
    settingsQuery.data?.pricePerPoint ?? DEFAULT_CREDIT_SETTINGS.pricePerPoint;
  const transaction = activityQuery.data
    ? transactionFrom(activityQuery.data, pricePerPoint)
    : null;
  const metadata = transaction
    ? Object.entries(transaction.metadata).filter(
        ([key]) => !SENSITIVE_KEY.test(key),
      )
    : [];

  return (
    <AdminWorkspace>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/admin/transactions">
            <ArrowLeft /> Back to transactions
          </Link>
        </Button>

        {activityQuery.isPending ? (
          <div className="space-y-5">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : activityQuery.isError || !transaction ? (
          <Card>
            <CardHeader>
              <CardTitle>Transaction could not be loaded</CardTitle>
              <CardDescription>
                The record may no longer exist or the activity service is unavailable.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge className="capitalize">{transaction.kind}</Badge>
                  <Badge variant="outline">{transaction.status}</Badge>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Transaction Details
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  {transaction.description}
                </p>
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="size-4" />
                {date(transaction.createdAt)}
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric
                label="Transaction amount"
                value={money(transaction.amount, transaction.currency)}
                icon={CreditCard}
              />
              <Metric
                label="Credit points"
                value={
                  transaction.points === null
                    ? "Not recorded"
                    : `${transaction.points.toLocaleString("en-NG")} points`
                }
                icon={Coins}
              />
              <Metric
                label="Payment channel"
                value={transaction.channel}
                icon={WalletCards}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment and vendor information</CardTitle>
                <CardDescription>
                  Identifiers and account information associated with this transaction.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <Detail icon={Hash} label="Internal reference" value={transaction.reference ?? "Not recorded"} />
                <Detail icon={UserRound} label="Vendor" value={transaction.vendor} />
                <Detail icon={Mail} label="Email" value={transaction.email ?? "Not recorded"} />
                <Detail icon={CreditCard} label="Status" value={transaction.status} />
                <Detail icon={WalletCards} label="Channel" value={transaction.channel} />
                <Detail icon={CalendarClock} label="Created" value={date(transaction.createdAt)} />
              </CardContent>
            </Card>

            {metadata.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Backend audit metadata</CardTitle>
                  <CardDescription>
                    Complete non-sensitive information returned by the activity endpoint.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                    {metadata.map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-xs capitalize text-muted-foreground">
                          {key.replaceAll("_", " ")}
                        </dt>
                        <dd className="mt-1 break-words text-sm font-medium">
                          {displayValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </AdminWorkspace>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Coins;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-lg border p-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return JSON.stringify(value, null, 2);
}
