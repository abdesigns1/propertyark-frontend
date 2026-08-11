"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Landmark,
  ReceiptText,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FINANCE_METRICS, FINANCE_TRANSACTIONS } from "./finance/data";
import { FinanceStatusBadge } from "./finance/finance-status-badge";
import { TransactionDetails } from "./finance/transaction-details";
import type { FinanceTransaction } from "./finance/types";

const PAGE_SIZE = 4;
const metricIcons = [WalletCards, CheckCircle2, Clock3, Landmark, ReceiptText];
const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function VendorFinance() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [propertyType, setPropertyType] = useState("ALL");
  const [dateLimit, setDateLimit] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(FINANCE_TRANSACTIONS[0].id);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

  const propertyTypes = ["Rent", "Sale", "Land", "Shortlet"];
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return FINANCE_TRANSACTIONS.filter((transaction) => {
      const matchesSearch =
        !search ||
        [
          transaction.id,
          transaction.user.name,
          transaction.property.name,
          transaction.property.location,
        ].some((value) => value.toLowerCase().includes(search));
      const matchesStatus = status === "ALL" || transaction.status === status;
      const matchesType =
        propertyType === "ALL" || transaction.property.type === propertyType;
      const matchesDate =
        !dateLimit || transaction.date.slice(0, 10) <= dateLimit;
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [dateLimit, propertyType, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const selected =
    FINANCE_TRANSACTIONS.find((transaction) => transaction.id === selectedId) ??
    visible[0] ??
    FINANCE_TRANSACTIONS[0];

  function selectTransaction(transaction: FinanceTransaction) {
    setSelectedId(transaction.id);
    setMobileDetailsOpen(true);
  }

  function exportTransactions() {
    const rows = [
      ["Transaction ID", "User", "Property", "Amount", "Status", "Date"],
      ...filtered.map((transaction) => [
        transaction.id,
        transaction.user.name,
        transaction.property.name,
        String(transaction.amount),
        transaction.status,
        transaction.date,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "propertyark-finance-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 pb-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant="outline" className="mb-3">
            Vendor finance
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Financial Overview
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Track your property sales, payments, and financial activities with
            real-time precision.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={exportTransactions}>
            <Download data-icon="inline-start" />
            Export Transactions
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info(
                "Financial reports will be available when the finance API is connected.",
              )
            }
          >
            <ReceiptText data-icon="inline-start" />
            Download Report
          </Button>
        </div>
      </header>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="Financial summary"
      >
        {FINANCE_METRICS.map((metric, index) => {
          const Icon = metricIcons[index];
          return (
            <Card key={metric.label}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                {metric.trend && (
                  <CardAction>
                    <Badge
                      variant={
                        metric.tone === "attention" ? "secondary" : "outline"
                      }
                    >
                      {metric.trend}
                    </Badge>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-primary">
                  {metric.label}
                </p>
                <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardContent className="grid gap-3 pt-0 lg:grid-cols-[minmax(280px,1fr)_auto_auto_auto]">
          <InputGroup className="h-11 bg-muted/30">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => updateFilter(setQuery, event.target.value)}
              placeholder="Search by buyer, property, or transaction ID"
              aria-label="Search transactions"
            />
          </InputGroup>
          <Select
            value={status}
            onValueChange={(value) => updateFilter(setStatus, value)}
          >
            <SelectTrigger className="h-11 w-full lg:w-40">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ESCROW_HELD">Escrow held</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={propertyType}
            onValueChange={(value) => updateFilter(setPropertyType, value)}
          >
            <SelectTrigger className="h-11 w-full lg:w-44">
              <SelectValue placeholder="Property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">All property types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <InputGroup className="h-11 lg:w-44">
            <InputGroupAddon>
              <CalendarDays />
            </InputGroupAddon>
            <InputGroupInput
              type="date"
              value={dateLimit}
              onChange={(event) =>
                updateFilter(setDateLimit, event.target.value)
              }
              aria-label="Show transactions through date"
            />
          </InputGroup>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card className="min-w-0">
          <CardHeader className="border-b">
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {filtered.length} mock transactions match your filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    data-state={
                      selected.id === transaction.id ? "selected" : undefined
                    }
                  >
                    <TableCell className="pl-5 font-mono text-xs font-semibold text-primary">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.user.name}
                    </TableCell>
                    <TableCell className="max-w-48 whitespace-normal">
                      <span className="line-clamp-2">
                        {transaction.property.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {currency.format(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <FinanceStatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell>
                      {date.format(new Date(transaction.date))}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectTransaction(transaction)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-36 text-center text-muted-foreground"
                    >
                      No transactions match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex-col justify-between gap-3 bg-card sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing {visible.length} of {filtered.length} transactions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === pageCount}
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>

        <aside
          className="hidden xl:block"
          aria-label="Selected transaction details"
        >
          <TransactionDetails transaction={selected} />
        </aside>
      </div>

      <footer className="flex flex-col items-center gap-2 border-t pt-8 text-center text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-primary">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Secure Transactions Powered by PropertyArk Escrow
        </p>
        <p>
          All transactions are encrypted and audited. Funds are protected by
          multi-signature verification protocols.
        </p>
      </footer>

      <Sheet open={mobileDetailsOpen} onOpenChange={setMobileDetailsOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-lg xl:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Transaction details</SheetTitle>
            <SheetDescription>
              Review the selected finance transaction.
            </SheetDescription>
          </SheetHeader>
          <TransactionDetails transaction={selected} compact />
        </SheetContent>
      </Sheet>
    </div>
  );
}
