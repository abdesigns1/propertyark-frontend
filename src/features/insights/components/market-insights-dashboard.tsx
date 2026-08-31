"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Banknote,
  Building2,
  CircleAlert,
  Clock3,
  MapPinned,
  TrendingUp,
} from "lucide-react";
import { useAllAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import type {
  Property,
  PropertyListingPurpose,
} from "@/features/properties/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTAINER, cn } from "@/lib/utils";

const PURPOSE_OPTIONS: Array<{
  value: PropertyListingPurpose;
  label: string;
  priceLabel: string;
}> = [
  { value: "sale", label: "For sale", priceLabel: "sale asking price" },
  { value: "rent", label: "For rent", priceLabel: "rental asking price" },
  {
    value: "shortlet",
    label: "Shortlet",
    priceLabel: "nightly asking price",
  },
  { value: "land", label: "Land", priceLabel: "land asking price" },
];

const inventoryChartConfig = {
  listings: { label: "Listings", color: "var(--chart-1)" },
} satisfies ChartConfig;

const priceChartConfig = {
  medianPrice: { label: "Median asking price", color: "var(--chart-2)" },
} satisfies ChartConfig;

const bedroomChartConfig = {
  count: { label: "Listings", color: "var(--chart-3)" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function validPrices(properties: Property[]) {
  return properties
    .map((property) => property.price)
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const midpoint = Math.floor(values.length / 2);
  return values.length % 2
    ? values[midpoint]
    : (values[midpoint - 1] + values[midpoint]) / 2;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function normalizeCity(property: Property) {
  return property.location.city.trim() || "Unspecified";
}

function buildCityData(properties: Property[]) {
  const groups = new Map<string, Property[]>();

  properties.forEach((property) => {
    const city = normalizeCity(property);
    groups.set(city, [...(groups.get(city) ?? []), property]);
  });

  return [...groups.entries()]
    .map(([city, cityProperties]) => {
      const prices = validPrices(cityProperties);
      return {
        city,
        listings: cityProperties.length,
        medianPrice: median(prices),
      };
    })
    .sort((a, b) => b.listings - a.listings || a.city.localeCompare(b.city));
}

function buildBedroomData(properties: Property[]) {
  const groups = new Map<string, number>();
  properties.forEach((property) => {
    const label =
      property.bedrooms >= 5
        ? "5+ beds"
        : property.bedrooms === 1
          ? "1 bed"
          : `${Math.max(0, property.bedrooms)} beds`;
    groups.set(label, (groups.get(label) ?? 0) + 1);
  });

  return [...groups.entries()]
    .map(([bedrooms, count]) => ({ bedrooms, count }))
    .sort((a, b) => Number.parseInt(a.bedrooms) - Number.parseInt(b.bedrooms));
}

function DashboardSkeleton() {
  return (
    <div className={cn(CONTAINER, "py-16")}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[420px] rounded-xl" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    </div>
  );
}

export function MarketInsightsDashboard() {
  const [purpose, setPurpose] = useState<PropertyListingPurpose>("sale");
  const [city, setCity] = useState("all");
  const propertiesQuery = useAllAvailableProperties();

  const availableProperties = useMemo(
    () => propertiesQuery.data ?? [],
    [propertiesQuery.data],
  );
  const cities = useMemo(
    () =>
      [...new Set(availableProperties.map(normalizeCity))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [availableProperties],
  );
  const purposeProperties = useMemo(
    () =>
      availableProperties.filter((property) => property.purpose === purpose),
    [availableProperties, purpose],
  );
  const filteredProperties = useMemo(
    () =>
      purposeProperties.filter(
        (property) => city === "all" || normalizeCity(property) === city,
      ),
    [city, purposeProperties],
  );
  const selectedPrices = useMemo(
    () => validPrices(filteredProperties),
    [filteredProperties],
  );
  const cityData = useMemo(
    () => buildCityData(purposeProperties).slice(0, 7),
    [purposeProperties],
  );
  const bedroomData = useMemo(
    () => buildBedroomData(filteredProperties),
    [filteredProperties],
  );
  const latestListings = useMemo(
    () =>
      [...filteredProperties]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [filteredProperties],
  );
  const currentPurpose =
    PURPOSE_OPTIONS.find((option) => option.value === purpose) ??
    PURPOSE_OPTIONS[0];

  if (propertiesQuery.isLoading) return <DashboardSkeleton />;

  if (propertiesQuery.isError) {
    return (
      <section className={cn(CONTAINER, "py-16")}>
        <Empty className="border bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleAlert aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Market data is temporarily unavailable</EmptyTitle>
            <EmptyDescription>
              We could not retrieve the current PropertyArk listings. Please try
              again shortly.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => propertiesQuery.refetch()}>Try again</Button>
          </EmptyContent>
        </Empty>
      </section>
    );
  }

  const selectedMedian = median(selectedPrices);
  const selectedAverage = average(selectedPrices);
  const coveredCities = new Set(filteredProperties.map(normalizeCity)).size;

  return (
    <main className="bg-muted/20">
      <section className={cn(CONTAINER, "py-14 sm:py-16")}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Live listing snapshot</Badge>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3.5" />
                Refreshes automatically from current listings
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
              Explore the PropertyArk marketplace
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Compare available inventory and asking prices without mixing sale,
              rent, land, and nightly shortlet rates.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={purpose}
              onValueChange={(value) =>
                setPurpose(value as PropertyListingPurpose)
              }
            >
              <SelectTrigger className="w-full min-w-44 bg-card sm:w-48">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PURPOSE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full min-w-44 bg-card sm:w-48">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Available listings",
              value: filteredProperties.length.toLocaleString(),
              description: `${currentPurpose.label}${city === "all" ? " across all cities" : ` in ${city}`}`,
              icon: Building2,
            },
            {
              label: "Median asking price",
              value: selectedMedian
                ? formatCompactCurrency(selectedMedian)
                : "—",
              description: currentPurpose.priceLabel,
              icon: Banknote,
            },
            {
              label: "Average asking price",
              value: selectedAverage
                ? formatCompactCurrency(selectedAverage)
                : "—",
              description: "Calculated from priced listings",
              icon: TrendingUp,
            },
            {
              label: "Cities represented",
              value: coveredCities.toLocaleString(),
              description: "Locations with available inventory",
              icon: MapPinned,
            },
          ].map((metric) => (
            <Card key={metric.label}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardDescription>{metric.label}</CardDescription>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <metric.icon aria-hidden="true" className="size-4" />
                  </div>
                </div>
                <CardTitle className="mt-2 text-2xl font-semibold">
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {metric.description}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 ? (
          <Empty className="mt-6 border bg-card py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No listings match this market</EmptyTitle>
              <EmptyDescription>
                Choose another city or listing purpose to view available market
                data.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => setCity("all")}>
                View all cities
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available inventory by city</CardTitle>
                  <CardDescription>
                    Cities with the largest number of current{" "}
                    {currentPurpose.label.toLowerCase()} listings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={inventoryChartConfig}
                    className="h-[330px] w-full"
                  >
                    <BarChart data={cityData} accessibilityLayer>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="city"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="listings"
                        fill="var(--color-listings)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Median asking price by city</CardTitle>
                  <CardDescription>
                    Typical advertised price among current listings in each
                    city.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={priceChartConfig}
                    className="h-[330px] w-full"
                  >
                    <BarChart data={cityData} accessibilityLayer>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="city"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <YAxis
                        tickFormatter={formatCompactCurrency}
                        tickLine={false}
                        axisLine={false}
                        width={62}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => (
                              <div className="flex min-w-40 items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Median price
                                </span>
                                <span className="font-mono font-medium">
                                  {formatCurrency(Number(value))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Bar
                        dataKey="medianPrice"
                        fill="var(--color-medianPrice)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Bedroom mix</CardTitle>
                  <CardDescription>
                    How available homes are distributed by bedroom count.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={bedroomChartConfig}
                    className="mx-auto h-[280px] w-full max-w-md"
                  >
                    <PieChart accessibilityLayer>
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="bedrooms" />}
                      />
                      <Pie
                        data={bedroomData}
                        dataKey="count"
                        nameKey="bedrooms"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {bedroomData.map((entry, index) => (
                          <Cell
                            key={entry.bedrooms}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="mt-2 flex flex-wrap justify-center gap-3">
                    {bedroomData.map((entry, index) => (
                      <span
                        key={entry.bedrooms}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        {entry.bedrooms}: {entry.count}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Newest available listings</CardTitle>
                  <CardDescription>
                    Recently added inventory in the selected market.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {latestListings.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className="group flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium group-hover:text-primary">
                          {property.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {normalizeCity(property)} · {property.bedrooms} beds ·{" "}
                          {property.bathrooms} baths
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-primary">
                          {formatCompactCurrency(property.price)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(property.createdAt))}
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="link" asChild>
                    <Link
                      href={`/properties?purpose=${purpose}${city === "all" ? "" : `&location=${encodeURIComponent(city)}`}`}
                    >
                      View matching properties
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleAlert aria-hidden="true" className="size-4 text-primary" />
              How to read these insights
            </CardTitle>
            <CardDescription className="leading-6">
              Figures are calculated from currently available PropertyArk
              listings and represent advertised asking prices—not completed sale
              prices, professional valuations, or financial advice. Results will
              become more representative as marketplace inventory grows.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </section>
    </main>
  );
}
