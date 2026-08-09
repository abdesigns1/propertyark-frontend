"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/features/properties/types";
import type {
  VendorInquiry,
  VendorPerformancePoint,
  VendorPropertyStatusPoint,
} from "@/features/vendor/types";

const performanceConfig = {
  views: { label: "Views", color: "var(--primary)" },
  inquiries: { label: "Inquiries", color: "var(--secondary)" },
} satisfies ChartConfig;

const propertyStatusConfig = {
  shortlet: { label: "Shortlet", color: "var(--primary)" },
  rent: { label: "For Rent", color: "var(--secondary)" },
  sale: { label: "For Sale", color: "var(--destructive)" },
  land: { label: "For Land", color: "var(--success)" },
} satisfies ChartConfig;

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-NG", { month: "short" });

function derivePerformance(
  inquiries: VendorInquiry[],
  totalViews: number,
  weekCount: number,
): VendorPerformancePoint[] {
  const now = Date.now();
  return Array.from({ length: weekCount }, (_, index) => {
    const oldestWeek = weekCount - 1 - index;
    const inquiriesInWeek = inquiries.filter((inquiry) => {
      const timestamp = new Date(inquiry.date).getTime();
      if (Number.isNaN(timestamp)) return false;
      const ageInDays = Math.floor((now - timestamp) / 86_400_000);
      return ageInDays >= oldestWeek * 7 && ageInDays < (oldestWeek + 1) * 7;
    }).length;
    return {
      label: `Week ${index + 1}`,
      date: new Date(now - oldestWeek * 7 * 86_400_000).toISOString(),
      // A cumulative backend count has no historical timestamps, so show it on
      // the latest point instead of presenting a misleading all-zero chart.
      views: index === weekCount - 1 ? totalViews : 0,
      inquiries: inquiriesInWeek,
    };
  });
}

function derivePropertyStatus(
  properties: Property[],
): VendorPropertyStatusPoint[] {
  const today = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (11 - index),
      1,
    );
    const propertiesInMonth = properties.filter((property) => {
      const createdAt = new Date(property.createdAt);
      return (
        createdAt.getFullYear() === date.getFullYear() &&
        createdAt.getMonth() === date.getMonth()
      );
    });
    return {
      month: MONTH_FORMATTER.format(date),
      shortlet: propertiesInMonth.filter(
        (property) => property.purpose === "shortlet",
      ).length,
      rent: propertiesInMonth.filter((property) => property.purpose === "rent")
        .length,
      sale: propertiesInMonth.filter((property) => property.purpose === "sale")
        .length,
      land: propertiesInMonth.filter((property) => property.purpose === "land")
        .length,
    };
  });
}

function PerformanceChart({
  performance,
  inquiries,
  totalViews,
}: {
  performance: VendorPerformancePoint[];
  inquiries: VendorInquiry[];
  totalViews: number;
}) {
  const [range, setRange] = useState("30");
  const data = useMemo(() => {
    const pointCount = range === "7" ? 2 : range === "90" ? 12 : 4;
    const inquirySeries = derivePerformance(
      inquiries,
      totalViews,
      pointCount,
    );
    const backendSeries = performance.slice(-pointCount);

    // Inquiry records are fresher than the aggregated vendor-stats response.
    // Keep historical backend views, but always calculate the inquiry line
    // from the authenticated vendor inquiry collection.
    return inquirySeries.map((point, index) => {
      const backendIndex = index - (pointCount - backendSeries.length);
      const backendPoint =
        backendIndex >= 0 ? backendSeries[backendIndex] : undefined;
      const backendViews = backendPoint?.views ?? 0;
      const isLatestPoint = index === pointCount - 1;
      return {
        ...point,
        // A stale aggregated series can contain zero even while the property
        // collection or stats summary reports views. Preserve historical
        // points and reconcile the newest point with the live total.
        views: isLatestPoint
          ? Math.max(backendViews, totalViews)
          : backendViews,
      };
    });
  }, [inquiries, performance, range, totalViews]);

  return (
    <Card className="min-h-[520px]">
      <CardHeader>
        <CardTitle className="text-lg">Listing Performance</CardTitle>
        <CardDescription className="sr-only">
          Views and inquiries across your selected period.
        </CardDescription>
        <CardAction>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-10 min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={performanceConfig}
          className="h-[410px] w-full"
        >
          <BarChart
            data={data}
            margin={{ top: 18, right: 12, bottom: 8, left: 0 }}
            accessibilityLayer
            barCategoryGap="34%"
            barGap={6}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={16}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickMargin={10}
              width={38}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) => {
                    const date = payload[0]?.payload?.date;
                    return date
                      ? formatTooltipDate(String(date))
                      : String(label ?? "");
                  }}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent className="gap-6 pt-5" />}
            />
            <Bar
              dataKey="views"
              fill="var(--color-views)"
              radius={[8, 8, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="inquiries"
              fill="var(--color-inquiries)"
              radius={[8, 8, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function formatTooltipDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function PropertyStatusChart({
  propertyStatus,
  properties,
}: {
  propertyStatus: VendorPropertyStatusPoint[];
  properties: Property[];
}) {
  const data = useMemo(() => {
    const currentMonths = derivePropertyStatus(properties);

    return currentMonths.map((currentMonth) => {
      const backendMonth = propertyStatus.find(
        (point) =>
          point.month.slice(0, 3).toLowerCase() ===
          currentMonth.month.slice(0, 3).toLowerCase(),
      );

      return backendMonth
        ? { ...backendMonth, month: currentMonth.month }
        : currentMonth;
    });
  }, [properties, propertyStatus]);

  return (
    <Card className="min-h-[520px]">
      <CardHeader>
        <CardTitle className="text-lg">Property Status</CardTitle>
        <CardDescription className="sr-only">
          Listing activity grouped by property purpose.
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Property status options"
          >
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={propertyStatusConfig}
          className="h-[410px] w-full"
        >
          <LineChart
            data={data}
            margin={{ top: 18, right: 16, bottom: 8, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={14}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={36}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend
              content={<ChartLegendContent className="gap-6 pt-5" />}
            />
            <Line
              dataKey="shortlet"
              type="natural"
              stroke="var(--color-shortlet)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls
            />
            <Line
              dataKey="rent"
              type="natural"
              stroke="var(--color-rent)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls
            />
            <Line
              dataKey="sale"
              type="natural"
              stroke="var(--color-sale)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls
            />
            <Line
              dataKey="land"
              type="natural"
              stroke="var(--color-land)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function VendorAnalyticsCharts({
  performance,
  propertyStatus,
  inquiries,
  properties,
  totalViews,
}: {
  performance: VendorPerformancePoint[];
  propertyStatus: VendorPropertyStatusPoint[];
  inquiries: VendorInquiry[];
  properties: Property[];
  totalViews: number;
}) {
  return (
    <section
      aria-label="Vendor analytics"
      className="grid gap-6 xl:grid-cols-2"
    >
      <PerformanceChart
        performance={performance}
        inquiries={inquiries}
        totalViews={totalViews}
      />
      <PropertyStatusChart
        propertyStatus={propertyStatus}
        properties={properties}
      />
    </section>
  );
}
