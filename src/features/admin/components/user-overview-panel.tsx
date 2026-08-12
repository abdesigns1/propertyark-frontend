"use client";

import { useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Clock3,
  FileText,
  History,
  Landmark,
  SearchCheck,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminUserInspections } from "@/features/admin/hooks/use-admin-dashboard";
import { formatAdminDate } from "@/features/admin/lib/user-display";
import type { VendorInspection } from "@/services/inspection.service";
import type { AdminUser } from "@/services/admin.service";
import { cn } from "@/lib/utils";

const userTabs = [
  { value: "overview", label: "Overview" },
  { value: "inspections", label: "Inspections" },
  { value: "transactions", label: "Transactions" },
  { value: "documents", label: "Documents" },
  { value: "activity-log", label: "Activity Log" },
] as const;

export function UserOverviewPanel({ user }: { user: AdminUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const inspectionsQuery = useAdminUserInspections({
    userId: user.id,
    email: user.email,
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
              {userTabs.map((tab) => (
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
              <PersonalInformation user={user} />
              <PlatformActivity user={user} />
              <PortfolioCard />
            </TabsContent>
            <TabsContent value="inspections">
              <UserInspectionsTab
                inspections={inspectionsQuery.data ?? []}
                loading={inspectionsQuery.isLoading}
                failed={inspectionsQuery.isError}
              />
            </TabsContent>
            <TabsContent value="transactions">
              <UnavailableTab
                icon={Landmark}
                title="No transaction records available"
                description="A user-specific admin transaction endpoint is not included in the current API collection."
              />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsTab user={user} />
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

function UserInspectionsTab({
  inspections,
  loading,
  failed,
}: {
  inspections: VendorInspection[];
  loading: boolean;
  failed: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const visibleInspections = inspections.filter((inspection) =>
    matchesInspectionFilter(inspection.status, statusFilter),
  );

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (failed) {
    return (
      <UnavailableTab
        icon={SearchCheck}
        title="Inspection records could not be loaded"
        description="The inquiries service did not allow the current administrator session to retrieve vendor inquiry records."
      />
    );
  }

  return (
    <div className="flex min-h-[460px] flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(value) => value && setStatusFilter(value)}
          size="sm"
          className="h-auto flex-nowrap gap-2 bg-transparent p-0"
        >
          {[
            { value: "all", label: "Status: All" },
            { value: "scheduled", label: "Scheduled" },
            { value: "completed", label: "Completed" },
            { value: "failed", label: "Failed" },
          ].map((filter) => (
            <ToggleGroupItem
              key={filter.value}
              value={filter.value}
              className={cn(
                "h-8 flex-none rounded-md border bg-background px-3 text-xs shadow-none",
                statusFilter === filter.value &&
                  "border-primary/20 bg-primary/5 font-semibold text-primary",
              )}
            >
              {filter.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarRange className="size-4" />
          {formatInspectionRange(inspections)}
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleInspections.map((inspection) => (
              <InspectionRow key={inspection.id} inspection={inspection} />
            ))}
          </TableBody>
        </Table>
        {!visibleInspections.length && (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SearchCheck className="size-5" />
            </span>
            <p className="mt-4 font-semibold">No inspection records found</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {inspections.length
                ? "No inspection record matches the selected status."
                : "The inquiry endpoint returned no inspection requests associated with this user's ID or email address."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InspectionRow({ inspection }: { inspection: VendorInspection }) {
  const status = inspection.status.toUpperCase();
  const schedule = inspection.inspectionDate
    ? formatAdminDate(inspection.inspectionDate)
    : "Not scheduled";

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{inspection.propertyName}</p>
      </TableCell>
      <TableCell className="capitalize text-muted-foreground">
        {(inspection.meetingType ?? "Property inspection")
          .toLowerCase()
          .replaceAll("_", " ")}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <p>{schedule}</p>
        {inspection.time && (
          <p className="text-xs text-muted-foreground">{inspection.time}</p>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {inspection.vendorName || "Not provided"}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            status === "PENDING" &&
              "border-warning/20 bg-warning/10 text-warning",
            ["ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(status) &&
              "border-primary/20 bg-primary/10 text-primary",
            status === "COMPLETED" &&
              "border-success/20 bg-success/10 text-success",
            ["DECLINED", "REJECTED", "CANCELLED"].includes(status) &&
              "border-destructive/20 bg-destructive/10 text-destructive",
          )}
        >
          {status.toLowerCase()}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function matchesInspectionFilter(status: string, filter: string) {
  const normalized = status.toUpperCase();
  if (filter === "all") return true;
  if (filter === "scheduled") {
    return ["PENDING", "ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(
      normalized,
    );
  }
  if (filter === "completed") return normalized === "COMPLETED";
  return ["DECLINED", "REJECTED", "CANCELLED", "FAILED"].includes(normalized);
}

function formatInspectionRange(inspections: VendorInspection[]) {
  const dates = inspections
    .map((inspection) => new Date(inspection.inspectionDate))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!dates.length) return "No scheduled date range";
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatter.format(dates[0])} - ${formatter.format(dates.at(-1)!)}`;
}

function PersonalInformation({ user }: { user: AdminUser }) {
  return (
    <section>
      <SectionTitle icon={UserRound}>Personal Information</SectionTitle>
      <div className="mt-5 flex max-w-lg flex-col gap-5">
        <Info label="Full legal name" value={user.fullName} />
        <Info
          label="Identity verification"
          value={user.isVerified ? "Verified ✓" : "Pending"}
          verified={user.isVerified}
        />
        <Info label="Date of birth" value="Not provided" />
        <Info label="Primary address" value={user.location || "Not provided"} />
      </div>
    </section>
  );
}

function PlatformActivity({ user }: { user: AdminUser }) {
  const events = [
    {
      icon: CalendarDays,
      title: "Account created",
      detail: "The user joined the PropertyArk platform.",
      date: user.createdAt,
    },
    ...(user.lastLogin
      ? [
          {
            icon: Clock3,
            title: "Last successful login",
            detail: "The user securely accessed their account.",
            date: user.lastLogin,
          },
        ]
      : []),
    ...(user.updatedAt
      ? [
          {
            icon: History,
            title: "Profile updated",
            detail: "The user's account information was updated.",
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

function PortfolioCard() {
  return (
    <Card className="border-primary bg-primary text-primary-foreground">
      <CardContent className="flex min-h-52 flex-col justify-between p-6">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest opacity-70">
              Portfolio Value
            </p>
            <p className="mt-2 text-4xl font-semibold">—</p>
          </div>
          <WalletCards className="size-16 opacity-20" />
        </div>
        <Button variant="secondary" disabled>
          View Financial Audit
        </Button>
      </CardContent>
    </Card>
  );
}

function DocumentsTab({ user }: { user: AdminUser }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle icon={FileText}>Verification Documents</SectionTitle>
      <DocumentRow label="Identity verification" available={user.isVerified} />
      <DocumentRow label="Address proof" available={Boolean(user.location)} />
    </div>
  );
}

function DocumentRow({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="size-5" />
      </span>
      <p className="flex-1 font-medium">{label}</p>
      <Badge variant={available ? "secondary" : "outline"}>
        {available ? "Passed" : "Not provided"}
      </Badge>
    </div>
  );
}

function ReliabilityScore({ user }: { user: AdminUser }) {
  const checks = [user.isVerified, Boolean(user.phone), Boolean(user.location)];
  const score = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
  return (
    <Card className="border-0 bg-primary/10 shadow-none">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ShieldCheck className="size-5" />
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

function UnavailableTab({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Empty className="min-h-96 rounded-xl border bg-muted/20">
      <EmptyHeader>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
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
      <Icon className="size-5 text-primary" />
      {children}
    </h2>
  );
}

function Info({
  label,
  value,
  verified = false,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={
          verified ? "mt-1 font-medium text-success" : "mt-1 font-medium"
        }
      >
        {value}
      </p>
    </div>
  );
}
