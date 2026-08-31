"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Download,
  Eye,
  LineChart,
  MessageSquareText,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/features/properties/components/property-card";
import { useFavorites } from "@/features/properties/hooks/use-favorites";
import {
  useBuyerDashboardStats,
  useBuyerRecentActivities,
} from "@/features/dashboard/hooks/use-buyer-dashboard-stats";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function BuyerInvestmentPortfolio() {
  const favorites = useFavorites();
  const stats = useBuyerDashboardStats();
  const activities = useBuyerRecentActivities();
  const properties = favorites.data?.properties ?? [];
  const watchlistValue = properties.reduce(
    (total, property) => total + property.price,
    0,
  );
  const averageValue = properties.length
    ? Math.round(watchlistValue / properties.length)
    : 0;
  const allocation = Object.entries(
    properties.reduce<Record<string, number>>((result, property) => {
      const label =
        property.purpose === "shortlet" ? "Shortlet" : property.type;
      result[label] = (result[label] ?? 0) + 1;
      return result;
    }, {}),
  ).sort((left, right) => right[1] - left[1]);

  function downloadReport() {
    const headings = ["Property", "Purpose", "Type", "Location", "Value"];
    const rows = properties.map((property) => [
      property.title,
      property.purpose,
      property.type,
      [
        property.location.address,
        property.location.city,
        property.location.state,
      ]
        .filter(Boolean)
        .join(", "),
      property.price,
    ]);
    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "propertyark-investment-watchlist.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (favorites.isLoading) return <PortfolioSkeleton />;

  if (favorites.isError)
    return (
      <Empty className="min-h-96 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>Portfolio could not be loaded</EmptyTitle>
          <EmptyDescription>
            Your saved investment opportunities are temporarily unavailable.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => favorites.refetch()}>Try again</Button>
        </EmptyContent>
      </Empty>
    );

  return (
    <main className="mx-auto max-w-[1500px]">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">Buyer portfolio</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Investment Portfolio
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Track shortlisted opportunities, active inquiries, and the estimated
            value of properties you are considering.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild>
            <Link href="/buyer/properties">Explore properties</Link>
          </Button>
          <Button disabled={!properties.length} onClick={downloadReport}>
            <Download data-icon="inline-start" />
            Download report
          </Button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortfolioMetric
          icon={WalletCards}
          label="Watchlist value"
          value={currency.format(watchlistValue)}
          note="Estimated listing value"
        />
        <PortfolioMetric
          icon={Eye}
          label="Saved opportunities"
          value={properties.length.toLocaleString()}
          note="Properties under consideration"
        />
        <PortfolioMetric
          icon={MessageSquareText}
          label="Active inquiries"
          value={stats.activeInquiries.toLocaleString()}
          note="Open conversations and inspections"
        />
        <PortfolioMetric
          icon={LineChart}
          label="Average property value"
          value={currency.format(averageValue)}
          note="Across your current watchlist"
        />
      </section>

      {!properties.length ? (
        <Empty className="mt-8 min-h-96 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>Build your investment watchlist</EmptyTitle>
            <EmptyDescription>
              Save properties that interest you and they will appear here as
              portfolio opportunities.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/buyer/properties">Explore properties</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Investment Watchlist
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Saved properties are opportunities, not completed purchases.
                </p>
              </div>
              <Button variant="link" asChild className="hidden sm:inline-flex">
                <Link href="/buyer/saved-properties">
                  View all <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist allocation</CardTitle>
                <CardDescription>
                  Distribution by property category.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {allocation.map(([label, count], index) => {
                  const percentage = Math.round(
                    (count / properties.length) * 100,
                  );
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "size-3 rounded-full",
                          index % 3 === 0
                            ? "bg-primary"
                            : index % 3 === 1
                              ? "bg-secondary"
                              : "bg-muted-foreground",
                        )}
                      />
                      <span className="flex-1 capitalize">
                        {label.replaceAll("-", " ")}
                      </span>
                      <span className="font-numeric font-medium">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent portfolio activity</CardTitle>
                <CardDescription>
                  Latest updates from your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {(activities.data ?? []).slice(0, 4).map((activity, index) => (
                  <div
                    key={`${activity.title}-${index}`}
                    className="flex gap-3"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        activity.color,
                      )}
                    />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
                {!activities.isLoading && !(activities.data ?? []).length && (
                  <p className="text-sm text-muted-foreground">
                    No recent portfolio activity yet.
                  </p>
                )}
                {activities.isLoading && (
                  <Skeleton className="h-24 rounded-xl" />
                )}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild>
                  <Link href="/buyer/notifications">View all updates</Link>
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      )}
    </main>
  );
}

function PortfolioMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardHeader>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-numeric text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {note}
      </CardContent>
    </Card>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-40 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
