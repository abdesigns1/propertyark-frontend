"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Eye,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminAllActivities } from "@/features/admin/hooks/use-admin-activity";
import { useAdminCreditSettings } from "@/features/admin/hooks/use-admin-credit";
import { PaginationControls } from "@/components/shared/pagination-controls";
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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminActivity } from "@/services/activity.service";
import { DEFAULT_CREDIT_SETTINGS } from "@/services/admin-credit.service";

type TransactionKind =
  "purchase" | "usage" | "payment" | "refund" | "adjustment";
export type TransactionRecord = {
  id: string;
  kind: TransactionKind;
  description: string;
  vendor: string;
  email: string | null;
  points: number | null;
  amount: number | null;
  currency: string;
  reference: string | null;
  status: string;
  channel: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

function recordsIn(value: unknown) {
  const records: Record<string, unknown>[] = [];
  const queue: unknown[] = [value];
  const visited = new Set<object>();

  while (queue.length) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (!current || typeof current !== "object" || visited.has(current))
      continue;
    visited.add(current);
    const source = current as Record<string, unknown>;
    records.push(source);
    queue.push(...Object.values(source));
  }
  return records;
}

function text(metadata: Record<string, unknown>, keys: string[]) {
  for (const record of recordsIn(metadata)) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number" && Number.isFinite(value))
        return String(value);
    }
  }
  return null;
}

function number(metadata: Record<string, unknown>, keys: string[]) {
  for (const record of recordsIn(metadata)) {
    for (const key of keys) {
      const candidate = record[key];
      if (typeof candidate === "number" && Number.isFinite(candidate))
        return candidate;
      if (typeof candidate === "string" && candidate.trim()) {
        const parsed = Number(candidate.replace(/[^\d.-]/g, ""));
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  }
  return null;
}

export function transactionFrom(
  activity: AdminActivity,
  pricePerPoint = DEFAULT_CREDIT_SETTINGS.pricePerPoint,
): TransactionRecord | null {
  const searchable =
    `${activity.action} ${activity.entityType} ${activity.title} ${activity.description} ${JSON.stringify(activity.metadata)}`.toUpperCase();
  if (
    !/CREDIT|POINT|PAYMENT|PAYSTACK|TRANSACTION|PURCHASE|FEATURE|REFUND/.test(
      searchable,
    )
  )
    return null;

  const rawPoints = number(activity.metadata, [
    "points",
    "creditPoints",
    "credit_points",
    "pointsUsed",
    "points_used",
    "pointsPurchased",
    "points_purchased",
    "pointAmount",
    "point_amount",
    "quantity",
    "credits",
    "creditAmount",
    "credit_amount",
  ]);
  const kind: TransactionKind = /REFUND|REVERSAL/.test(searchable)
    ? "refund"
    : /PURCHASE|TOP.?UP|PAYSTACK/.test(searchable)
      ? "purchase"
      : /USED|DEBIT|SPEND|FEATURE|LISTING/.test(searchable)
        ? "usage"
        : /PAYMENT/.test(searchable)
          ? "payment"
          : "adjustment";
  const amount = number(activity.metadata, [
    "amountPaid",
    "amount_paid",
    "paymentAmount",
    "payment_amount",
    "totalAmount",
    "total_amount",
    "totalPrice",
    "total_price",
    "amount",
    "value",
  ]);
  const calculatedPoints =
    rawPoints === null &&
    kind === "purchase" &&
    amount !== null &&
    pricePerPoint > 0 &&
    Number.isInteger(amount / pricePerPoint)
      ? amount / pricePerPoint
      : rawPoints;
  const points =
    calculatedPoints === null
      ? null
      : kind === "usage"
        ? -Math.abs(calculatedPoints)
        : calculatedPoints;

  // CREDIT_POINT audit events also contain page visits and administrative
  // activity. They are not ledger transactions without a monetary or point
  // movement.
  if (amount === null && points === null) return null;

  return {
    id: activity.id,
    kind,
    description: activity.title || activity.description,
    vendor:
      text(activity.metadata, [
        "vendorName",
        "vendor_name",
        "businessName",
        "business_name",
        "userName",
        "user_name",
        "fullName",
        "full_name",
        "name",
      ]) ?? activity.actor.name,
    email:
      text(activity.metadata, [
        "vendorEmail",
        "vendor_email",
        "email",
        "userEmail",
        "user_email",
      ]) ?? activity.actor.email,
    points,
    amount,
    currency: text(activity.metadata, ["currency"]) ?? "NGN",
    reference: text(activity.metadata, [
      "reference",
      "ref",
      "paymentReference",
      "payment_reference",
      "transactionReference",
      "transaction_reference",
      "transactionRef",
      "transaction_ref",
      "paystackReference",
      "paystack_reference",
      "purchaseNumber",
      "purchase_number",
      // Activity records currently expose the credit-purchase record ID but
      // not the Paystack reference. Use that stable ID as the internal ref.
      "entityId",
      "entity_id",
    ]),
    status: (
      text(activity.metadata, [
        "paymentStatus",
        "payment_status",
        "transactionStatus",
        "transaction_status",
        "status",
      ]) ??
      (/INITIALIZE|INITIATED|PENDING/.test(searchable)
        ? "INITIATED"
        : "RECORDED")
    ).toUpperCase(),
    channel:
      text(activity.metadata, [
        "channel",
        "provider",
        "paymentProvider",
        "payment_provider",
        "gateway",
      ]) ??
      (kind === "purchase" || /PAYSTACK/.test(searchable)
        ? "Paystack"
        : "Credit wallet"),
    createdAt: activity.createdAt,
    metadata: activity.metadata,
  };
}

export function money(value: number | null, currency: string) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
}

function statusVariant(status: string) {
  return /SUCCESS|COMPLETED|PAID/.test(status)
    ? ("secondary" as const)
    : ("outline" as const);
}

export function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const settingsQuery = useAdminCreditSettings();
  const pricePerPoint =
    settingsQuery.data?.pricePerPoint ?? DEFAULT_CREDIT_SETTINGS.pricePerPoint;
  const query = useAdminAllActivities("CREDIT_POINT");
  const transactions = useMemo(() => {
    const unique = new Map<string, TransactionRecord>();
    (query.data ?? [])
      .map((activity) => transactionFrom(activity, pricePerPoint))
      .filter((item): item is TransactionRecord => Boolean(item))
      .forEach((transaction) => {
        const key = transaction.reference || transaction.id;
        const existing = unique.get(key);
        if (
          !existing ||
          new Date(transaction.createdAt).getTime() >=
            new Date(existing.createdAt).getTime()
        )
          unique.set(key, transaction);
      });
    return Array.from(unique.values()).sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
  }, [pricePerPoint, query.data]);
  const filtered = useMemo(
    () =>
      transactions.filter((item) => {
        const matchesKind = kind === "all" || item.kind === kind;
        const needle = search.trim().toLowerCase();
        return (
          matchesKind &&
          (!needle ||
            `${item.description} ${item.vendor} ${item.email ?? ""} ${item.reference ?? ""}`
              .toLowerCase()
              .includes(needle))
        );
      }),
    [kind, search, transactions],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * 10, safePage * 10);
  const revenue = transactions.reduce(
    (sum, item) => sum + (item.kind === "purchase" ? (item.amount ?? 0) : 0),
    0,
  );
  const purchased = transactions.reduce(
    (sum, item) =>
      sum + (item.kind === "purchase" ? Math.max(item.points ?? 0, 0) : 0),
    0,
  );
  const used = transactions.reduce(
    (sum, item) =>
      sum + (item.kind === "usage" ? Math.abs(item.points ?? 0) : 0),
    0,
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Transactions
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Audit point purchases, Paystack payments, wallet usage, refunds,
              and administrative adjustments.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} />{" "}
            Refresh
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Summary
            title="Total transactions"
            value={transactions.length.toLocaleString()}
            icon={ReceiptText}
            loading={query.isPending}
          />
          <Summary
            title="Recorded purchase value"
            value={money(revenue, "NGN")}
            icon={CreditCard}
            loading={query.isPending}
          />
          <Summary
            title="Points purchased"
            value={purchased.toLocaleString()}
            icon={ArrowDownLeft}
            loading={query.isPending}
          />
          <Summary
            title="Points used"
            value={used.toLocaleString()}
            icon={ArrowUpRight}
            loading={query.isPending}
          />
        </div>

        <Card>
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Point and payment ledger</CardTitle>
              <CardDescription>
                Showing transaction events from the platform audit history.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search vendor or reference"
                  className="pl-9 sm:w-72"
                />
              </div>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="purchase">Point purchases</SelectItem>
                  <SelectItem value="usage">Point usage</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {query.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : query.isError ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ReceiptText />
                  </EmptyMedia>
                  <EmptyTitle>Transaction history unavailable</EmptyTitle>
                  <EmptyDescription>
                    The admin activity service could not be reached. Try again
                    shortly.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : visible.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <WalletCards />
                  </EmptyMedia>
                  <EmptyTitle>No matching transactions</EmptyTitle>
                  <EmptyDescription>
                    Point and payment events will appear here when they are
                    recorded by the backend.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="max-w-60 truncate font-medium">
                          {item.description}
                        </p>
                        <p className="capitalize text-xs text-muted-foreground">
                          {item.kind}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.vendor}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.email ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-40 truncate font-mono text-xs">
                        {item.reference ?? "—"}
                      </TableCell>
                      <TableCell>{item.channel}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{date(item.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {money(item.amount, item.currency)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.points === null
                          ? "—"
                          : `${item.points > 0 ? "+" : ""}${item.points.toLocaleString()}`}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`View ${item.description}`}
                          asChild
                        >
                          <Link
                            href={`/admin/transactions/${encodeURIComponent(item.id)}`}
                          >
                            <Eye />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {totalPages > 1 && (
              <div className="mt-5 border-t pt-5">
                <PaginationControls
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </AdminWorkspace>
  );
}

function Summary({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  icon: typeof ReceiptText;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
