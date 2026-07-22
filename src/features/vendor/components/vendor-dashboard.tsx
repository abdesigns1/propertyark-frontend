"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ClipboardClock,
  MailOpen,
  PlusCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import { useAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import type { Property } from "@/features/properties/types";
import { useVendorDashboard } from "@/features/vendor/hooks/use-vendor-dashboard";
import type {
  VendorDashboardStats,
  VendorInquiry,
} from "@/features/vendor/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrencyParts } from "@/utils/formatters";
import { VendorAnalyticsCharts } from "./vendor-analytics-charts";

const ZERO_STATS: VendorDashboardStats = {
  totalListings: 0,
  activeListings: 0,
  pendingApproval: 0,
  leadsReceived: 0,
  acceptedInquiries: 0,
  pendingInquiries: 0,
  declinedInquiries: 0,
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  urgent = false,
}: {
  label: string;
  value: number;
  note: string;
  icon: typeof Building2;
  urgent?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <CardAction>
          <Badge variant={urgent ? "secondary" : "outline"}>{note}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="size-10 rounded-lg" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function PropertyPrice({ property }: { property: Property }) {
  const { symbol, number } = formatCurrencyParts(
    property.price,
    property.currency,
  );
  return (
    <span className="font-semibold">
      {symbol}
      {number}
    </span>
  );
}

function statusVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("accept") ||
    normalized.includes("active") ||
    normalized.includes("available")
  )
    return "default";
  if (normalized.includes("declin") || normalized.includes("reject"))
    return "destructive";
  if (normalized.includes("pending")) return "secondary";
  return "outline";
}

function RecentProperties({ properties }: { properties: Property[] }) {
  return (
    <Card id="properties">
      <CardHeader className="border-b">
        <CardTitle>Recent Properties</CardTitle>
        <CardDescription>
          Your latest active listings from the marketplace.
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link href="/vendor/properties">View all properties</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {properties.length ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface/70">
                <TableHead className="pl-4">Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="pl-4">
                    <div className="flex min-w-56 items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={property.images[0]}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{property.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {property.location.city}, {property.location.state}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PropertyPrice property={property} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(property.status)}>
                      {property.status.replaceAll("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {property.purpose}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty className="min-h-52">
            <EmptyHeader>
              <EmptyTitle>No active properties yet</EmptyTitle>
              <EmptyDescription>
                Your published Vendor listings will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

function RecentInquiries({ inquiries }: { inquiries: VendorInquiry[] }) {
  return (
    <Card id="inquiries">
      <CardHeader className="border-b">
        <CardTitle>Recent Inquiries</CardTitle>
        <CardDescription>
          Latest leads received for your listings.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {inquiries.length ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface/70">
                <TableHead className="pl-4">Lead</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="pl-4">
                    <div className="flex min-w-48 items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {initials(inquiry.name) || "PA"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{inquiry.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {inquiry.email ?? "No email provided"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-64 truncate">
                    {inquiry.propertyName}
                  </TableCell>
                  <TableCell>{formatDate(inquiry.date)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(inquiry.status)}>
                      {inquiry.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty className="min-h-52">
            <EmptyHeader>
              <EmptyTitle>No inquiries yet</EmptyTitle>
              <EmptyDescription>
                New property leads will appear here automatically.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

export function VendorDashboard() {
  const dashboardUser = useDashboardUser();
  const storedUser = useAuthStore((state) => state.user);
  const userId = useAuthStore((state) => state.userId);
  const updateUser = useAuthStore((state) => state.updateUser);
  const dashboard = useVendorDashboard();
  const availableProperties = useAvailableProperties(1, 100);
  const profile = dashboard.data?.profile;

  useEffect(() => {
    if (!profile) return;
    updateUser({
      ...(profile.id ? { id: profile.id } : {}),
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      phone: profile.phone,
      location: profile.location,
    });
  }, [profile, updateUser]);

  const stats = dashboard.data?.stats ?? ZERO_STATS;
  const vendorId = profile?.id ?? storedUser?.id ?? userId;
  const vendorProperties = useMemo(
    () =>
      (availableProperties.data?.properties ?? []).filter((property) =>
        Boolean(vendorId && property.vendorId === vendorId),
      ),
    [availableProperties.data?.properties, vendorId],
  );
  const properties = vendorProperties.slice(0, 5);
  const firstName =
    profile?.fullName.split(/\s+/)[0] || dashboardUser.firstName;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7">
      <section className="relative isolate min-h-56 overflow-hidden rounded-2xl bg-primary text-primary-foreground">
        <Image
          src="/assets/images/hero-property.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) calc(100vw - 18rem), 100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-primary/75" />
        <div className="flex min-h-56 flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <Badge variant="secondary" className="mb-5">
              Vendor
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80 sm:text-base">
              Here&apos;s what&apos;s happening with your listings and property
              leads today.
            </p>
          </div>
          <Button variant="secondary" size="lg" asChild id="add-property">
            <Link href="/vendor/properties/new">
              <PlusCircle data-icon="inline-start" />
              Add Property
            </Link>
          </Button>
        </div>
      </section>

      <section
        aria-label="Vendor statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboard.isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Total Listings"
              value={stats.totalListings}
              note="All time"
              icon={Building2}
            />
            <StatCard
              label="Active Listings"
              value={stats.activeListings}
              note="Live"
              icon={CheckCircle2}
            />
            <StatCard
              label="Pending Approval"
              value={stats.pendingApproval}
              note="Needs review"
              icon={ClipboardClock}
              urgent={stats.pendingApproval > 0}
            />
            <StatCard
              label="Leads Received"
              value={stats.leadsReceived}
              note="Inquiries"
              icon={MailOpen}
            />
          </>
        )}
      </section>

      <VendorAnalyticsCharts
        performance={dashboard.data?.performance ?? []}
        propertyStatus={dashboard.data?.propertyStatus ?? []}
        inquiries={dashboard.data?.inquiries ?? []}
        properties={vendorProperties}
      />

      {availableProperties.isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <RecentProperties properties={properties} />
      )}

      {dashboard.isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <RecentInquiries inquiries={dashboard.data?.inquiries ?? []} />
      )}

      {dashboard.isError && (
        <p className={cn("text-center text-sm text-muted-foreground")}>
          Some Vendor information is temporarily unavailable and will refresh
          automatically.
        </p>
      )}
    </div>
  );
}
