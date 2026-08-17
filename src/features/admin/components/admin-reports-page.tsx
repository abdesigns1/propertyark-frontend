"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  FileChartColumn,
  House,
  Users,
  WalletCards,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  RevenuePerformanceCard,
  TransactionAnalyticsCard,
  UserGrowthCard,
} from "@/features/admin/components/admin-reports-charts";
import {
  CategoryDistributionCard,
  CustomReportCard,
  InsightsCard,
  TopLocationsCard,
  TransactionFeedCard,
} from "@/features/admin/components/admin-reports-panels";
import { financeDataForPeriod } from "@/features/admin/data/admin-reports-finance-mock";
import { useAdminReportsAnalytics } from "@/features/admin/hooks/use-admin-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  filterReportsAnalytics,
  type ReportFilterPeriod,
} from "@/services/admin-reports.service";

const periodOptions: Array<{ value: ReportFilterPeriod; label: string }> = [
  { value: "default", label: "Default" },
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

export function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportFilterPeriod>("default");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRange, setCustomRange] = useState(() => defaultCustomRange());
  const reportsQuery = useAdminReportsAnalytics();
  const analytics = useMemo(
    () =>
      reportsQuery.data
        ? filterReportsAnalytics(reportsQuery.data, {
            period,
            startDate: customRange.start,
            endDate: customRange.end,
          })
        : undefined,
    [customRange.end, customRange.start, period, reportsQuery.data],
  );
  const customDays = Math.max(
    1,
    Math.ceil(
      (new Date(customRange.end).getTime() -
        new Date(customRange.start).getTime()) /
        86_400_000,
    ),
  );
  const finance = useMemo(
    () => financeDataForPeriod(period, customDays),
    [customDays, period],
  );
  const periodLabel =
    periodOptions.find((option) => option.value === period)?.label ?? "Default";

  const stats = [
    {
      label: "Total Revenue",
      value: formatCompactCurrency(finance.summary.totalRevenue),
      change: finance.summary.revenueChange,
      icon: WalletCards,
      tone: "blue",
    },
    {
      label: "Transactions",
      value: finance.summary.totalTransactions.toLocaleString(),
      change: finance.summary.transactionChange,
      icon: CreditCard,
      tone: "orange",
    },
    {
      label: "Active Users",
      value: (analytics?.activeUsers ?? 0).toLocaleString(),
      change: analytics?.activeUsersChange ?? 0,
      icon: Users,
      tone: "orange",
    },
    {
      label: "Listings",
      value: (analytics?.totalListings ?? 0).toLocaleString(),
      change: analytics?.listingsChange ?? 0,
      icon: House,
      tone: "blue",
    },
    {
      label: "Conv. Rate",
      value: `${finance.summary.conversionRate}%`,
      change: finance.summary.conversionChange,
      icon: ChartNoAxesCombined,
      tone: "orange",
    },
  ] as const;

  function exportData() {
    const rows = [
      ["Report", "Value"],
      ["Active Users", analytics?.activeUsers ?? 0],
      ["Total Listings", analytics?.totalListings ?? 0],
      ...(analytics?.categories ?? []).map((item) => [
        `Category: ${item.label}`,
        `${item.value}%`,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `propertyark-analytics-${period}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Reports &amp; Analytics
            </h1>
            <p className="mt-1 max-w-xl text-muted-foreground">
              Track platform performance, financial growth, and user activities
              through detailed insights.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(value) => {
                if (!value && period === "custom") {
                  setShowCustomRange((visible) => !visible);
                  return;
                }
                if (!value) return;
                const nextPeriod = value as ReportFilterPeriod;
                setPeriod(nextPeriod);
                setShowCustomRange(nextPeriod === "custom");
              }}
              className="h-10 w-full max-w-full justify-start overflow-x-auto sm:w-auto"
            >
              {periodOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="min-w-16"
                >
                  {option.value === "custom" && <CalendarDays />} {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {period === "custom" && showCustomRange && (
              <FieldGroup className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-3">
                <Field>
                  <FieldLabel htmlFor="report-start-date">From</FieldLabel>
                  <Input
                    id="report-start-date"
                    type="date"
                    value={customRange.start}
                    max={customRange.end}
                    onChange={(event) =>
                      setCustomRange((range) => ({
                        ...range,
                        start: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="report-end-date">To</FieldLabel>
                  <Input
                    id="report-end-date"
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(event) =>
                      setCustomRange((range) => ({
                        ...range,
                        end: event.target.value,
                      }))
                    }
                  />
                </Field>
              </FieldGroup>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportData}>
                <ArrowDownToLine data-icon="inline-start" />
                Export Data
              </Button>
              <Button
                onClick={() =>
                  document
                    .querySelector("#custom-report")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <FileChartColumn data-icon="inline-start" />
                Generate Report
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {reportsQuery.isLoading
            ? Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-36 rounded-xl" />
              ))
            : stats.map((stat) => (
                <ReportStatCard key={stat.label} {...stat} />
              ))}
        </section>

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,2.05fr)_380px]">
          <section className="min-w-0 space-y-6">
            <RevenuePerformanceCard
              data={finance.revenuePerformance}
              periodLabel={periodLabel}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <TransactionAnalyticsCard
                data={finance.transactions}
                total={finance.transactionTotal}
              />
              <UserGrowthCard
                data={
                  analytics?.userGrowth ?? {
                    daily: [],
                    weekly: [],
                    monthly: [],
                    yearly: [],
                  }
                }
              />
            </div>
            <TopLocationsCard locations={analytics?.locations ?? []} />
          </section>
          <aside className="space-y-6">
            <InsightsCard periodLabel={periodLabel} />
            <CategoryDistributionCard
              categories={analytics?.categories ?? []}
            />
            <CustomReportCard />
          </aside>
        </div>

        <section className="mt-6">
          <TransactionFeedCard items={finance.feed} />
        </section>
        <footer className="mt-16 border-t py-8 text-center text-sm text-muted-foreground">
          © 2026 PropertyArk. All rights reserved. Data encrypted with 256-bit
          AES.
        </footer>
      </main>
    </AdminWorkspace>
  );
}

interface ReportStatCardProps {
  label: string;
  value: string;
  change: number;
  icon: typeof WalletCards;
  tone: "blue" | "orange";
}

function ReportStatCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: ReportStatCardProps) {
  const positive = change > 0;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "grid size-10 place-items-center rounded-lg",
              tone === "blue"
                ? "bg-primary/10 text-primary"
                : "bg-secondary/15 text-secondary",
            )}
          >
            <Icon className="size-5" />
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              positive
                ? "text-emerald-600"
                : change < 0
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : change < 0 ? (
              <ArrowDownRight className="size-3" />
            ) : (
              "−"
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatCompactCurrency(value: number) {
  return `₦${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function defaultCustomRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 30);
  return { start: dateInputValue(start), end: dateInputValue(end) };
}

function dateInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
