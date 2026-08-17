/**
 * Temporary finance-only presentation data. Replace this module when the
 * backend exposes revenue, transaction, conversion, and report endpoints.
 */
export const financeSummaryMock = {
  totalRevenue: 8_500_000_000,
  totalTransactions: 12_540,
  conversionRate: 68,
  revenueChange: 12.5,
  transactionChange: 5.2,
  conversionChange: -2.4,
};

export const revenuePerformanceMock = [
  { label: "Jan", revenue: 185, subscriptions: 149 },
  { label: "Feb", revenue: 162, subscriptions: 176 },
  { label: "Mar", revenue: 224, subscriptions: 158 },
  { label: "Apr", revenue: 199, subscriptions: 231 },
  { label: "May", revenue: 154, subscriptions: 214 },
  { label: "Jun", revenue: 185, subscriptions: 248 },
  { label: "Jul", revenue: 155, subscriptions: 191 },
];

export const transactionAnalyticsMock = [
  { name: "Completed", value: 75, color: "var(--primary)" },
  { name: "Pending", value: 15, color: "var(--secondary)" },
  { name: "Disputed", value: 2, color: "var(--destructive)" },
];

export const recentReportsMock = [
  { name: "May_Revenue.pdf", meta: "24 May 2024 • Admin", format: "PDF" },
  { name: "Q2_Vendor_Growth.csv", meta: "20 May 2024 • System", format: "CSV" },
] as const;

export const transactionFeedMock = [
  {
    id: "finance-1",
    initials: "JD",
    name: "John Doe",
    description: "Escrow Payment - Unit 4B Lekki",
    amount: 120_000_000,
    status: "COMPLETED",
    time: "2 mins ago",
  },
  {
    id: "finance-2",
    initials: "AS",
    name: "Amina Salisu",
    description: "Subscription Renewal - Vendor Gold",
    amount: 450_000,
    status: "COMPLETED",
    time: "15 mins ago",
  },
  {
    id: "finance-3",
    initials: "MK",
    name: "Musa Kalu",
    description: "Property Listing Fee - Abuja Office",
    amount: 75_000,
    status: "PENDING",
    time: "42 mins ago",
  },
] as const;

export function financeDataForPeriod(
  period: "default" | "today" | "week" | "month" | "year" | "custom",
  customDays = 30,
) {
  const scale =
    period === "default"
      ? 1
      : period === "today"
        ? 0.004
        : period === "week"
          ? 0.025
          : period === "month"
            ? 0.12
            : period === "year"
              ? 0.84
              : Math.min(Math.max(customDays, 1) / 365, 1);
  const variation =
    period === "today"
      ? 2.4
      : period === "week"
        ? 4.8
        : period === "month"
          ? 8.1
          : period === "year"
            ? 11.6
            : 12.5;
  const chartScale =
    period === "default"
      ? 1
      : period === "today"
        ? 0.16
        : period === "week"
          ? 0.34
          : period === "month"
            ? 0.62
            : period === "year"
              ? 1.08
              : Math.min(0.25 + scale, 1.1);

  return {
    summary: {
      ...financeSummaryMock,
      totalRevenue: Math.round(financeSummaryMock.totalRevenue * scale),
      totalTransactions: Math.max(
        1,
        Math.round(financeSummaryMock.totalTransactions * scale),
      ),
      revenueChange: variation,
      transactionChange: Math.max(1.2, variation - 2.3),
      conversionRate: Math.max(
        1,
        Math.round(financeSummaryMock.conversionRate - (1 - scale) * 4),
      ),
      conversionChange:
        period === "default" ? -2.4 : Math.round((scale * 4 - 2) * 10) / 10,
    },
    revenuePerformance: revenuePerformanceMock.map((point, index) => ({
      ...point,
      revenue: Math.max(1, Math.round(point.revenue * chartScale + index * 2)),
      subscriptions: Math.max(
        1,
        Math.round(point.subscriptions * chartScale + index),
      ),
    })),
    transactions: transactionAnalyticsMock.map((item, index) => ({
      ...item,
      value: Math.max(1, item.value + (period === "default" ? 0 : index - 1)),
    })),
    transactionTotal: Math.max(1, Math.round(12_000 * scale)),
    feed: transactionFeedMock.slice(
      0,
      period === "today" ? 1 : period === "week" ? 2 : 3,
    ),
  };
}
