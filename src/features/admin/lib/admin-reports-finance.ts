import type { AdminActivity } from "@/services/activity.service";
import type { AdminManagedProperty } from "@/services/admin.service";
import {
  reportDateRange,
  type ReportDateFilter,
} from "@/services/admin-reports.service";
import {
  transactionFrom,
  type TransactionRecord,
} from "@/features/admin/components/admin-transactions-page";

export type ReportTransactionFeedItem = {
  id: string;
  initials: string;
  name: string;
  description: string;
  amount: number;
  status: string;
  time: string;
};

export type ReportFinanceData = {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    conversionRate: number;
    revenueChange: number;
    transactionChange: number;
    conversionChange: number;
  };
  revenuePerformance: Array<{
    label: string;
    revenue: number;
    transactions: number;
  }>;
  transactions: Array<{ name: string; value: number; color: string }>;
  transactionTotal: number;
  feed: ReportTransactionFeedItem[];
};

function transactionKey(transaction: TransactionRecord) {
  return transaction.reference || transaction.id;
}

function deduplicatedTransactions(activities: AdminActivity[]) {
  const transactions = new Map<string, TransactionRecord>();

  activities.forEach((activity) => {
    const transaction = transactionFrom(activity);
    if (!transaction || transaction.amount === null || transaction.amount <= 0)
      return;
    const key = transactionKey(transaction);
    const existing = transactions.get(key);
    const existingDate = existing ? new Date(existing.createdAt).getTime() : 0;
    const currentDate = new Date(transaction.createdAt).getTime();
    if (!existing || currentDate >= existingDate)
      transactions.set(key, transaction);
  });

  return Array.from(transactions.values()).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
}

function within(
  transaction: TransactionRecord,
  range: { start: Date; end: Date } | null,
) {
  if (!range) return true;
  const date = new Date(transaction.createdAt);
  return (
    !Number.isNaN(date.getTime()) && date >= range.start && date <= range.end
  );
}

function totals(transactions: TransactionRecord[]) {
  const totalRevenue = transactions.reduce((sum, transaction) => {
    const amount = transaction.amount ?? 0;
    return sum + (transaction.kind === "refund" ? -amount : amount);
  }, 0);
  const completed = transactions.filter((transaction) =>
    /COMPLETED|SUCCESS|PAID|RECORDED/.test(transaction.status),
  ).length;

  return {
    totalRevenue,
    totalTransactions: transactions.length,
    conversionRate: transactions.length
      ? Math.round((completed / transactions.length) * 1000) / 10
      : 0,
  };
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function chartBuckets(
  transactions: TransactionRecord[],
  filter: ReportDateFilter,
) {
  const now = new Date();
  const daily = filter.period === "today" || filter.period === "week";
  const count = daily ? 7 : 7;
  const dates = Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    if (daily) date.setDate(now.getDate() - (count - 1 - index));
    else {
      date.setDate(1);
      date.setMonth(now.getMonth() - (count - 1 - index));
    }
    return date;
  });
  const key = (value: Date) =>
    daily
      ? `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`
      : `${value.getFullYear()}-${value.getMonth()}`;
  const points = dates.map((date) => ({
    key: key(date),
    label: new Intl.DateTimeFormat(
      "en",
      daily ? { weekday: "short" } : { month: "short", year: "2-digit" },
    ).format(date),
    revenue: 0,
    transactions: 0,
  }));
  const buckets = new Map(points.map((point) => [point.key, point]));

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const point = buckets.get(key(date));
    if (!point) return;
    point.transactions += 1;
    point.revenue +=
      (transaction.kind === "refund" ? -1 : 1) * (transaction.amount ?? 0);
  });

  return points.map((point) => ({
    label: point.label,
    revenue: point.revenue,
    transactions: point.transactions,
  }));
}

function statusAnalytics(transactions: TransactionRecord[]) {
  const counts = { Completed: 0, Pending: 0, Failed: 0 };
  transactions.forEach((transaction) => {
    if (/COMPLETED|SUCCESS|PAID|RECORDED/.test(transaction.status))
      counts.Completed += 1;
    else if (/FAILED|DECLINED|CANCELLED|REVERSED/.test(transaction.status))
      counts.Failed += 1;
    else counts.Pending += 1;
  });
  const total = transactions.length || 1;

  return [
    {
      name: "Completed",
      value: Math.round((counts.Completed / total) * 100),
      color: "var(--primary)",
    },
    {
      name: "Pending",
      value: Math.round((counts.Pending / total) * 100),
      color: "var(--secondary)",
    },
    {
      name: "Failed",
      value: Math.round((counts.Failed / total) * 100),
      color: "var(--destructive)",
    },
  ];
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Time unavailable";
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function financeDataFromActivities(
  activities: AdminActivity[],
  filter: ReportDateFilter,
): ReportFinanceData {
  const all = deduplicatedTransactions(activities);
  const range = reportDateRange(filter);
  const selected = all.filter((transaction) => within(transaction, range));
  const current = totals(selected);
  let previous = { totalRevenue: 0, totalTransactions: 0, conversionRate: 0 };

  if (range) {
    const duration = range.end.getTime() - range.start.getTime();
    const previousRange = {
      start: new Date(range.start.getTime() - duration - 1),
      end: new Date(range.start.getTime() - 1),
    };
    previous = totals(
      all.filter((transaction) => within(transaction, previousRange)),
    );
  }

  return {
    summary: {
      ...current,
      revenueChange: range
        ? percentageChange(current.totalRevenue, previous.totalRevenue)
        : 0,
      transactionChange: range
        ? percentageChange(
            current.totalTransactions,
            previous.totalTransactions,
          )
        : 0,
      conversionChange: range
        ? percentageChange(current.conversionRate, previous.conversionRate)
        : 0,
    },
    revenuePerformance: chartBuckets(selected, filter),
    transactions: statusAnalytics(selected),
    transactionTotal: selected.length,
    feed: selected.slice(0, 10).map((transaction) => ({
      id: transaction.id,
      initials:
        transaction.vendor
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "TX",
      name: transaction.vendor,
      description: transaction.description,
      amount: transaction.amount ?? 0,
      status: transaction.status,
      time: relativeTime(transaction.createdAt),
    })),
  };
}

export function transactionCountsByLocation(
  activities: AdminActivity[],
  properties: AdminManagedProperty[],
) {
  const counts = new Map<string, number>();
  const transactions = deduplicatedTransactions(activities).filter(
    (transaction) => /COMPLETED|SUCCESS|PAID|RECORDED/.test(transaction.status),
  );

  transactions.forEach((transaction) => {
    const searchable = `${transaction.description} ${JSON.stringify(transaction.metadata)}`;
    const property = properties.find((candidate) =>
      searchable.includes(candidate.id),
    );
    if (!property) return;
    const location =
      [property.city, property.state].filter(Boolean).join(", ") ||
      "Location not provided";
    counts.set(location, (counts.get(location) ?? 0) + 1);
  });

  return counts;
}
