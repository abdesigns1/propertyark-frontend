"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
): VendorPerformancePoint[] {
  const now = Date.now();
  return Array.from({ length: 4 }, (_, index) => {
    const oldestWeek = 3 - index;
    const inquiriesInWeek = inquiries.filter((inquiry) => {
      const timestamp = new Date(inquiry.date).getTime();
      if (Number.isNaN(timestamp)) return false;
      const ageInDays = Math.floor((now - timestamp) / 86_400_000);
      return ageInDays >= oldestWeek * 7 && ageInDays < (oldestWeek + 1) * 7;
    }).length;
    return {
      label: `Week ${index + 1}`,
      date: null,
      // A cumulative backend count has no historical timestamps, so show it on
      // the latest point instead of presenting a misleading all-zero chart.
      views: index === 3 ? totalViews : 0,
      inquiries: inquiriesInWeek,
    };
  });
}

function derivePropertyStatus(
  properties: Property[],
): VendorPropertyStatusPoint[] {
  const today = new Date();
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (3 - index),
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
    const source = performance.length
      ? performance
      : derivePerformance(inquiries, totalViews);
    const pointCount = range === "7" ? 2 : range === "90" ? 12 : 4;
    return source.slice(-pointCount);
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
        <ChartContainer config={performanceConfig} className="h-[410px] w-full">
          <LineChart
            data={data}
            margin={{ top: 18, right: 12, bottom: 10, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} strokeDasharray="0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={16}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis hide allowDecimals={false} />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
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
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="views"
              type="monotone"
              stroke="var(--color-views)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="inquiries"
              type="monotone"
              stroke="var(--color-inquiries)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
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
  const data = useMemo(
    () =>
      propertyStatus.length ? propertyStatus : derivePropertyStatus(properties),
    [properties, propertyStatus],
  );

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
            margin={{ top: 18, right: 12, bottom: 10, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={16}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis hide allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="shortlet"
              type="monotone"
              stroke="var(--color-shortlet)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="rent"
              type="monotone"
              stroke="var(--color-rent)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="sale"
              type="monotone"
              stroke="var(--color-sale)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="land"
              type="monotone"
              stroke="var(--color-land)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
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
