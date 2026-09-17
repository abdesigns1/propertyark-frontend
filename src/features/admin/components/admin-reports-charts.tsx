"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ReportGrowthPoint } from "@/services/admin-reports.service";
import type { ReportGrowthPeriod } from "@/services/admin-reports.service";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--primary)" },
  transactions: { label: "Transactions", color: "var(--secondary)" },
} satisfies ChartConfig;

const growthConfig = {
  users: { label: "Users", color: "var(--primary)" },
  vendors: { label: "Vendors", color: "var(--secondary)" },
} satisfies ChartConfig;

export function RevenuePerformanceCard({
  data,
  periodLabel,
}: {
  data: Array<{
    label: string;
    revenue: number;
    transactions: number;
  }>;
  periodLabel: string;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="pt-6">
        <CardTitle>Revenue Performance</CardTitle>
        <CardDescription>
          Platform income streams for {periodLabel.toLowerCase()}
        </CardDescription>
        <div className="mt-1 flex items-center gap-5 text-xs font-medium sm:absolute sm:right-6 sm:top-6">
          <ChartLegend color="bg-primary" label="Revenue" />
          <ChartLegend color="bg-secondary" label="Transactions" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer
          config={revenueConfig}
          className="h-[310px] w-full aspect-auto"
        >
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="revenue"
              tickFormatter={(value) =>
                new Intl.NumberFormat("en", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <YAxis
              yAxisId="transactions"
              orientation="right"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex min-w-32 items-center justify-between gap-3">
                      <span>
                        {
                          revenueConfig[name as keyof typeof revenueConfig]
                            ?.label
                        }
                      </span>
                      <span className="font-semibold">
                        {name === "revenue"
                          ? new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              maximumFractionDigits: 0,
                            }).format(Number(value))
                          : Number(value).toLocaleString("en-NG")}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              yAxisId="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="transactions"
              yAxisId="transactions"
              stroke="var(--color-transactions)"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="flex flex-col justify-between gap-2 border-t py-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            Revenue and transaction activity are calculated from recorded
            platform payment events.
          </p>
          <Link
            href="/admin/transactions"
            className="font-medium text-primary"
          >
            View Full Ledger →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionAnalyticsCard({
  data,
  total,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: true, margin: "-80px" });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transaction Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid items-center gap-4 sm:grid-cols-[150px_1fr]">
        <div ref={chartRef} className="relative mx-auto size-36">
          <ChartContainer
            config={{}}
            className="absolute inset-0 size-full aspect-square"
          >
            <PieChart>
              <Pie
                key={isInView ? "visible" : "hidden"}
                data={data.map((item) => ({
                  ...item,
                  value: isInView ? item.value : 0,
                }))}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={66}
                strokeWidth={0}
                isAnimationActive={isInView}
                animationBegin={120}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="text-xl font-bold">
              {new Intl.NumberFormat("en", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(total)}
            </p>
            <p className="text-[10px] uppercase text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
              <span className="ml-auto font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function UserGrowthCard({
  data,
}: {
  data: Record<ReportGrowthPeriod, ReportGrowthPoint[]>;
}) {
  const [period, setPeriod] = useState<ReportGrowthPeriod>("daily");

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardAction>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as ReportGrowthPeriod)}
          >
            <SelectTrigger className="min-w-28" aria-label="User growth period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={growthConfig}
          className="h-36 w-full aspect-auto"
        >
          <BarChart data={data[period]} accessibilityLayer barGap={2}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="users"
              fill="var(--color-users)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="vendors"
              fill="var(--color-vendors)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <p className="mt-3 text-sm text-muted-foreground">
          Live registrations grouped by account type for the selected period.
        </p>
      </CardContent>
    </Card>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}
