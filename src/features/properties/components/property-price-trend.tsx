"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Price } from "@/components/shared/price";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Property } from "@/features/properties/types";
import type { PropertyPriceComparison } from "@/features/properties/utils/property-price-comparison";
import { cn } from "@/lib/utils";

const chartConfig = {
  value: { label: "Asking price", color: "var(--primary)" },
} satisfies ChartConfig;

function formatCompactPrice(value: number, currency: Property["currency"]) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function propertyDescription(property: Property) {
  const bedroomLabel = property.bedrooms ? `${property.bedrooms}-bedroom ` : "";
  const typeLabel = property.type.replaceAll("-", " ");
  return `${bedroomLabel}${typeLabel}`;
}

function differenceCopy(percentage: number) {
  const absolutePercentage = Math.abs(percentage).toLocaleString("en-NG", {
    maximumFractionDigits: 1,
  });

  if (Math.abs(percentage) < 0.05) return "matches the market average";
  return `${absolutePercentage}% ${percentage > 0 ? "higher" : "lower"} than the market average`;
}

export function PropertyPriceTrend({
  property,
  comparison,
}: {
  property: Property;
  comparison: PropertyPriceComparison;
}) {
  const chartData = [
    {
      label: "Market average",
      value: comparison.averagePrice,
      color: "var(--muted-foreground)",
    },
    {
      label: "This property",
      value: property.price,
      color: "var(--primary)",
    },
  ];
  const period =
    property.purpose === "rent" && property.rentDuration
      ? `/${property.rentDuration.toLowerCase()}`
      : "";
  const differenceTone =
    comparison.difference > 0
      ? "text-destructive"
      : comparison.difference < 0
        ? "text-emerald-700"
        : "text-foreground";

  return (
    <Card className="gap-6 py-6 sm:py-8">
      <CardHeader className="gap-2 px-6 sm:px-8">
        <CardTitle className="text-2xl font-semibold">Price Trend</CardTitle>
        <CardDescription className="text-base text-foreground">
          Current average asking price for {propertyDescription(property)}{" "}
          properties in {comparison.scopeLabel}
          {period}.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 px-6 sm:px-8">
        <div className="w-fit rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-xs sm:text-base">
          <Price amount={property.price} currency={property.currency} />{" "}
          {differenceCopy(comparison.percentageDifference)}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-muted-foreground" />
            Market average
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            Property price
          </span>
        </div>

        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            accessibilityLayer
            margin={{ left: 4, right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) =>
                formatCompactPrice(Number(value), property.currency)
              }
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={94}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <div className="flex min-w-44 items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {String(item.payload.label)}
                      </span>
                      <Price
                        amount={Number(value)}
                        currency={property.currency}
                        className="font-medium"
                      />
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="grid gap-3 border-t pt-6 sm:grid-cols-3">
          <PriceSummary
            label="Average price"
            amount={comparison.averagePrice}
            currency={property.currency}
            detail={`${comparison.comparableCount} comparable listings`}
          />
          <PriceSummary
            label="This property"
            amount={property.price}
            currency={property.currency}
            detail="Current asking price"
          />
          <PriceSummary
            label="Difference"
            amount={Math.abs(comparison.difference)}
            currency={property.currency}
            prefix={
              comparison.difference > 0
                ? "+"
                : comparison.difference < 0
                  ? "−"
                  : undefined
            }
            detail={`${comparison.percentageDifference > 0 ? "+" : ""}${comparison.percentageDifference.toLocaleString("en-NG", { maximumFractionDigits: 1 })}%`}
            className={differenceTone}
          />
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          Based on comparable PropertyArk listings. Asking prices may differ
          from final transaction values.
        </p>
      </CardContent>
    </Card>
  );
}

function PriceSummary({
  label,
  amount,
  currency,
  detail,
  prefix,
  className,
}: {
  label: string;
  amount: number;
  currency: Property["currency"];
  detail: string;
  prefix?: string;
  className?: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className={cn("mt-2 text-lg font-semibold", className)}>
        {prefix}
        <Price amount={amount} currency={currency} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
