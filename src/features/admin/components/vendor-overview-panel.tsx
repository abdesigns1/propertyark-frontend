"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Landmark,
  UserRound,
  WalletCards,
} from "lucide-react";
import { formatAdminDate } from "@/features/admin/lib/user-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/features/properties/types";
import { AdminInspectionsTable } from "@/features/admin/components/admin-inspections-table";
import { useAdminVendorInspections } from "@/features/admin/hooks/use-admin-dashboard";
import type { AdminUser } from "@/services/admin.service";
import { cn } from "@/lib/utils";

const vendorTabs = [
  { value: "overview", label: "Overview" },
  { value: "properties", label: "Properties" },
  { value: "inspections", label: "Inspections" },
  { value: "transactions", label: "Transactions" },
  { value: "documents", label: "Documents" },
  { value: "activity-log", label: "Activity Log" },
] as const;

export function VendorOverviewPanel({
  user,
  properties,
  propertiesLoading,
}: {
  user: AdminUser;
  properties: Property[];
  propertiesLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const inspectionsQuery = useAdminVendorInspections({
    vendorId: user.id,
    email: user.email,
    propertyIds: properties.map((property) => property.id),
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden py-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-col gap-0"
        >
          <CardHeader className="border-b p-0">
            <TabsList
              variant="line"
              className="h-auto w-full justify-between overflow-x-auto rounded-none px-2"
            >
              {vendorTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "relative rounded-none px-5 py-5 after:hidden",
                    activeTab === tab.value && "font-semibold text-primary",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.value && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-[3px] bg-primary"
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent className="w-full p-6">
            <TabsContent
              value="overview"
              className="w-full flex-col gap-8 data-[state=active]:flex"
            >
              <VendorInformation user={user} />
              <PlatformActivity user={user} />
              <VendorHighlights
                properties={properties}
                propertiesLoading={propertiesLoading}
              />
            </TabsContent>
            <TabsContent value="properties">
              <VendorProperties
                properties={properties}
                propertiesLoading={propertiesLoading}
              />
            </TabsContent>
            <TabsContent value="inspections">
              <AdminInspectionsTable
                inspections={inspectionsQuery.data ?? []}
                loading={inspectionsQuery.isLoading}
                failed={inspectionsQuery.isError}
                subject="vendor"
              />
            </TabsContent>
            <TabsContent value="transactions">
              <VendorTransactions properties={properties} />
            </TabsContent>
            <TabsContent value="documents">
              <VendorDocuments user={user} properties={properties} />
            </TabsContent>
            <TabsContent value="activity-log">
              <PlatformActivity user={user} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      <ReliabilityScore user={user} />
    </div>
  );
}

function VendorInformation({ user }: { user: AdminUser }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <SectionTitle icon={UserRound}>Personal Information</SectionTitle>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Info label="Full legal name" value={user.fullName} />
          <Info label="Date of birth" value="Not provided" />
          <Info
            label="Primary address"
            value={user.location || "Not provided"}
            wide
          />
        </div>
      </section>
      <section>
        <SectionTitle icon={BriefcaseBusiness}>Business Entity</SectionTitle>
        <div className="mt-5 flex flex-col gap-5">
          <Info label="Company name" value="Not provided" />
          <Info label="License number" value="Not provided" />
          <Info label="Registration date" value="Not provided" />
          <Info
            label="Operations region"
            value={user.location || "Not provided"}
          />
        </div>
      </section>
    </div>
  );
}

function PlatformActivity({ user }: { user: AdminUser }) {
  const events = [
    {
      icon: CalendarDays,
      title: "Vendor account created",
      detail: "Account joined the PropertyArk platform.",
      date: user.createdAt,
    },
    ...(user.lastLogin
      ? [
          {
            icon: Clock3,
            title: "Last successful login",
            detail: "Vendor securely accessed the platform.",
            date: user.lastLogin,
          },
        ]
      : []),
    ...(user.updatedAt
      ? [
          {
            icon: History,
            title: "Profile updated",
            detail: "The vendor's profile information was updated.",
            date: user.updatedAt,
          },
        ]
      : []),
  ];

  return (
    <section>
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <History className="size-5 text-primary" /> Platform Activity
        </h2>
        <Button variant="link" size="sm" disabled>
          View History
        </Button>
      </div>
      <div className="mt-5 flex flex-col gap-5">
        {events.map(({ icon: Icon, title, detail, date }) => (
          <div
            key={`${title}-${date}`}
            className="grid grid-cols-[48px_1fr] items-center gap-4"
          >
            <span className="flex size-10 items-center justify-center rounded-full border-2 border-primary text-primary">
              <Icon className="size-4" />
            </span>
            <div className="rounded-xl border px-4 py-4">
              <div className="flex flex-col justify-between gap-1 sm:flex-row">
                <p className="font-semibold">{title}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatAdminDate(date)}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VendorHighlights({
  properties,
  propertiesLoading,
}: {
  properties: Property[];
  propertiesLoading: boolean;
}) {
  const portfolioValue = properties.reduce(
    (total, property) => total + property.price,
    0,
  );
  const topProperty = [...properties].sort((a, b) => b.price - a.price)[0];

  if (propertiesLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card className="border-primary bg-primary text-primary-foreground">
        <CardContent className="flex min-h-48 flex-col justify-between p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest opacity-70">
              Portfolio Value
            </p>
            <p className="mt-2 text-4xl font-semibold">
              {formatCurrency(portfolioValue)}
            </p>
          </div>
          <Button variant="secondary" disabled>
            View Financial Audit
          </Button>
        </CardContent>
      </Card>
      <Card className="border-warning">
        <CardContent className="flex min-h-48 flex-col justify-between p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="font-semibold">Top Performing Asset</p>
            <WalletCards className="size-8 text-warning" />
          </div>
          {topProperty ? (
            <div className="flex items-center gap-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={topProperty.images[0]}
                  alt={topProperty.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">{topProperty.title}</p>
                <p className="text-sm text-muted-foreground">
                  {topProperty.location.city}, {topProperty.location.state}
                </p>
                <p className="mt-1 font-medium text-primary">
                  {formatCurrency(topProperty.price)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This vendor has no available properties.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VendorProperties({
  properties,
  propertiesLoading,
}: {
  properties: Property[];
  propertiesLoading: boolean;
}) {
  if (propertiesLoading) return <Skeleton className="h-96 w-full" />;

  if (!properties.length) {
    return (
      <Empty className="min-h-96">
        <EmptyHeader>
          <EmptyTitle>No available properties</EmptyTitle>
          <EmptyDescription>
            No public property listing is currently associated with this vendor.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden py-0">
          <div className="relative h-40">
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <p className="font-semibold">{property.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {property.location.city}, {property.location.state}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-semibold text-primary">
                {formatCurrency(property.price)}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/properties/${property.id}`}>View Property</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function VendorTransactions({ properties }: { properties: Property[] }) {
  const portfolioValue = properties.reduce(
    (total, property) => total + property.price,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <TabHeading
        title="Transactions"
        description="Financial records associated with this vendor's property portfolio."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={Landmark}
          label="Portfolio value"
          value={formatCurrency(portfolioValue)}
        />
        <SummaryCard
          icon={Building2}
          label="Listed properties"
          value={properties.length.toString()}
        />
      </div>
      <Empty className="min-h-72 rounded-xl border bg-muted/20">
        <EmptyHeader>
          <EmptyTitle>No transaction records available</EmptyTitle>
          <EmptyDescription>
            The current API does not expose an administrator transaction ledger
            for an individual vendor.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

function VendorDocuments({
  user,
  properties,
}: {
  user: AdminUser;
  properties: Property[];
}) {
  const documents = properties.flatMap((property) =>
    (property.documents ?? []).map((document) => ({
      ...document,
      propertyName: property.title,
    })),
  );

  return (
    <div className="flex flex-col gap-5">
      <TabHeading
        title="Documents"
        description="Verification and property documents linked to this vendor."
      />
      <DocumentRow
        label="Identity verification"
        detail="Vendor account verification"
        available={user.isVerified}
      />
      <DocumentRow
        label="Address proof"
        detail={user.location || "Address not provided"}
        available={Boolean(user.location)}
      />
      {documents.map((document) => (
        <DocumentRow
          key={document.id}
          label={document.name}
          detail={document.propertyName}
          available
        />
      ))}
    </div>
  );
}

function DocumentRow({
  label,
  detail,
  available,
}: {
  label: string;
  detail: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="size-5" />
      </span>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <Badge variant={available ? "secondary" : "outline"}>
        {available ? "Available" : "Pending"}
      </Badge>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TabHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function ReliabilityScore({ user }: { user: AdminUser }) {
  const checks = [
    user.isVerified,
    Boolean(user.phone),
    Boolean(user.location),
    user.ninVerificationStatus === "VERIFIED",
  ];
  const score = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
  return (
    <Card className="border-0 bg-primary/10 shadow-none">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Account Reliability Score</p>
          <p className="text-sm text-muted-foreground">
            Calculated from the verification information available for this
            account.
          </p>
        </div>
        <div className="min-w-32 text-right">
          <p className="text-2xl font-semibold text-primary">{score}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/15">
            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 border-b pb-2 text-lg font-medium">
      <Icon className="size-5 text-primary" /> {children}
    </h2>
  );
}

function Info({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
