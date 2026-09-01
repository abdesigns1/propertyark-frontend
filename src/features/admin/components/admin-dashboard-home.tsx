"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  HelpCircle,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  UserPlus,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { overviewStats } from "@/features/admin/data/dashboard-data";
import {
  useAdminDashboard,
  useAdminGrowthHistory,
  useAdminKycRequests,
  useAdminKycStats,
  useAdminUsers,
} from "@/features/admin/hooks/use-admin-dashboard";
import type { AdminGrowthHistory } from "@/features/admin/hooks/use-admin-dashboard";
import { useAdminActivities } from "@/features/admin/hooks/use-admin-activity";
import { formatActivityTime } from "@/features/admin/lib/admin-activity-display";
import type {
  AdminDashboardData,
  AdminKycRequest,
  AdminKycStats,
  AdminProperty,
  AdminUser,
} from "@/services/admin.service";
import type { AdminActivity } from "@/services/activity.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminRoleBadge } from "@/features/admin/components/admin-role-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const chartConfig = {
  users: { label: "User Growth", color: "var(--primary)" },
  listings: { label: "Listings", color: "var(--secondary)" },
  revenue: { label: "Revenue", color: "var(--success)" },
} satisfies ChartConfig;

const userTabClassName =
  "relative min-w-24 rounded-none border-0 px-6 py-4 text-base font-medium text-muted-foreground after:hidden";

const userTabs = [
  { value: "all", label: "All Users" },
  { value: "users", label: "Users" },
  { value: "vendors", label: "Vendors" },
  { value: "admins", label: "Admins" },
] as const;

function DashboardHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const initials =
    user?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SY";

  function handleLogout() {
    clearAuth();
    router.replace("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="h-dvh w-72 overflow-hidden border-0 p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search dashboard"
          placeholder="Search properties, areas..."
          className="h-10 bg-surface pl-10"
        />
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Help">
          <HelpCircle />
        </Button>
        <div className="mx-2 hidden h-8 w-px bg-border sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open administrator menu"
              className="group flex items-center gap-2 rounded-full p-1 pr-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden size-4 transition-transform group-data-[state=open]:rotate-180 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-64">
            <DropdownMenuLabel className="p-3">
              <span className="block truncate text-sm font-semibold text-foreground">
                {user?.fullName || "System Administrator"}
              </span>
              <span className="mt-0.5 block truncate font-normal text-muted-foreground">
                {user?.email || "PropertyArk administrator"}
              </span>
              <Badge variant="secondary" className="mt-2 capitalize">
                {role === "staff" ? "Staff" : "Super Admin"}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => router.push("/")}>
                <House />
                Go to Home
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push("/admin/dashboard")}
              >
                <LayoutDashboard />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("#users")}>
                <UserRound />
                User management
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>
                <Settings />
                System settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function OverviewCards({
  stats,
}: {
  stats?: AdminDashboardData["dashboardStats"];
}) {
  const values = [
    stats?.totalUsers,
    stats?.activeVendors,
    stats?.totalProperties,
    undefined,
    stats?.pendingReviews,
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {overviewStats.map(
        ({ label, value, note, change, icon: Icon }, index) => (
          <Card key={label} className="py-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
                    index === 4 && "bg-destructive/10 text-destructive",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <Badge variant={index === 4 ? "destructive" : "secondary"}>
                  {change}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold tracking-tight">
                {values[index]?.toLocaleString() ?? value}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {note}
              </p>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

function GrowthChart({
  data,
  history,
}: {
  data?: AdminDashboardData["growthRevenue"];
  history?: AdminGrowthHistory;
}) {
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");
  const now = new Date();
  const bucketDates = Array.from(
    { length: period === "day" ? 7 : period === "month" ? 12 : 5 },
    (_, index) => {
      const date = new Date(now);
      if (period === "day") date.setDate(now.getDate() - (6 - index));
      if (period === "month") {
        date.setDate(1);
        date.setMonth(now.getMonth() - (11 - index));
      }
      if (period === "year") {
        date.setMonth(0, 1);
        date.setFullYear(now.getFullYear() - (4 - index));
      }
      return date;
    },
  );
  const keyFor = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return period === "year"
      ? String(year)
      : period === "month"
        ? `${year}-${month}`
        : `${year}-${month}-${day}`;
  };
  const chartData = bucketDates.map((date) => ({
    date: keyFor(date),
    label:
      period === "year"
        ? String(date.getFullYear())
        : new Intl.DateTimeFormat("en", {
            ...(period === "day"
              ? { weekday: "short", day: "numeric" }
              : { month: "short", year: "2-digit" }),
          }).format(date),
    users: 0,
    listings: 0,
    revenue: 0,
  }));
  const buckets = new Map(chartData.map((point) => [point.date, point]));

  history?.users.forEach((user) => {
    const point = buckets.get(keyFor(user.createdAt));
    if (point) point.users += 1;
  });
  history?.properties.forEach((property) => {
    const point = buckets.get(keyFor(property.createdAt));
    if (point) point.listings += 1;
  });
  history?.activities.forEach((activity) => {
    if (
      !/PAYMENT|TRANSACTION|ESCROW/.test(
        `${activity.action} ${activity.entityType}`,
      )
    )
      return;
    const rawAmount =
      activity.metadata.amount ??
      activity.metadata.totalAmount ??
      activity.metadata.value ??
      0;
    const amount =
      typeof rawAmount === "string"
        ? Number(rawAmount.replace(/[^0-9.-]/g, ""))
        : Number(rawAmount);
    const point = buckets.get(keyFor(activity.createdAt));
    if (point && Number.isFinite(amount)) point.revenue += amount;
  });

  if (!history) {
    data?.userGrowth.forEach((item) => {
      const point = buckets.get(keyFor(item.date));
      if (point) {
        point.users += item.newUsers ?? 0;
        point.revenue += item.revenue ?? 0;
      }
    });
    data?.listingGrowth.forEach((item) => {
      const point = buckets.get(keyFor(item.date));
      if (point) {
        point.listings += item.newListings ?? 0;
        point.revenue += item.revenue ?? 0;
      }
    });
  }

  return (
    <Card className="min-w-0 bg-card py-0">
      <CardHeader className="border-b py-5">
        <CardTitle className="text-xl">Growth & Revenue</CardTitle>
        <CardDescription className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {Object.entries(chartConfig).map(([key, item]) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 text-xs font-medium text-foreground"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(value) => {
              if (value === "day" || value === "month" || value === "year")
                setPeriod(value);
            }}
            size="sm"
          >
            <ToggleGroupItem value="day" className="min-w-14">
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="min-w-16">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="year" className="min-w-14">
              Year
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-5">
        <ChartContainer
          config={chartConfig}
          className="h-72 w-full aspect-auto"
        >
          <ComposedChart
            data={chartData}
            accessibilityLayer
            barCategoryGap="28%"
            barGap={4}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis
              yAxisId="activity"
              tickLine={false}
              axisLine={false}
              width={34}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            />
            <ChartTooltip
              cursor={{ fill: "var(--surface)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="users"
              yAxisId="activity"
              fill="var(--color-users)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="listings"
              yAxisId="activity"
              fill="var(--color-listings)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Line
              dataKey="revenue"
              yAxisId="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={3}
              dot={{ r: 3, fill: "var(--color-revenue)" }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ActivitiesCard({
  activities,
  loading,
}: {
  activities: AdminActivity[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-12 w-full" />
            ))}
          </div>
        ) : activities.length ? (
          <ol className="flex flex-col gap-5">
            {activities.slice(0, 4).map((item, index) => (
              <li key={item.id} className="relative flex gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {item.actor.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("") || "SY"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatActivityTime(item.createdAt)} · {item.entityType}
                  </p>
                </div>
                {index < Math.min(activities.length, 4) - 1 && (
                  <span className="absolute left-[18px] top-10 h-4 w-px bg-border" />
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            No platform activities have been recorded yet.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/activity">View All Activity</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function PropertiesTable({
  properties = [],
}: {
  properties?: AdminProperty[];
}) {
  const rows = properties.slice(0, 6);
  const money = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });
  return (
    <Card
      id="properties"
      className="flex min-h-0 flex-1 flex-col overflow-hidden py-0"
    >
      <CardHeader className="border-b py-5">
        <CardTitle className="text-xl">Property Management</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/properties">View All Listings</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow>
              <TableHead className="h-12 pl-5">Listing name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((property) => {
              const pending = property.listingStatus === "PENDING";
              const price = property.priceDisplay?.amount
                ? money.format(property.priceDisplay.amount)
                : (property.priceDisplay?.display ?? "—");
              return (
                <TableRow key={property.id} className="h-[68px]">
                  <TableCell className="max-w-44 whitespace-normal pl-5 font-semibold">
                    {property.name}
                  </TableCell>
                  <TableCell className="max-w-36 whitespace-normal">
                    {property.vendor?.fullName || "—"}
                  </TableCell>
                  <TableCell className="max-w-44 whitespace-normal">
                    {[property.city, property.state]
                      .filter(Boolean)
                      .join(", ") || property.address}
                  </TableCell>
                  <TableCell className="font-medium">{price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={pending ? "outline" : "secondary"}
                      className={cn(
                        !pending && "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {pending
                        ? "Pending"
                        : property.listingStatus
                            .toLowerCase()
                            .replace(/^./, (letter) => letter.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button size="sm" asChild>
                      <Link href={`/admin/properties/${property.id}`}>
                        {pending ? "Review" : "View"}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="mt-auto justify-between bg-surface/50 py-4 text-xs text-muted-foreground">
        <span>
          Showing 1 to {rows.length} of {properties.length} entries
        </span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#properties" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#properties">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#properties">3</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}

function VerificationCard({
  stats,
  requests,
  loading,
}: {
  stats?: AdminKycStats;
  requests: AdminKycRequest[];
  loading: boolean;
}) {
  return (
    <Card id="kyc">
      <CardHeader>
        <CardTitle>KYC & Verification</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-semibold text-primary">
              {loading ? "—" : (stats?.pending ?? 0).toLocaleString()}
            </p>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Pending
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-semibold text-success">
              {loading ? "—" : (stats?.verified ?? 0).toLocaleString()}
            </p>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Approved
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {requests.slice(0, 3).map((request) => (
            <Link
              key={request.id}
              href={`/admin/users/${request.userId}`}
              className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {request.fullName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  Awaiting verification
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
          {!loading && requests.length === 0 && (
            <p className="text-sm text-muted-foreground">
              There are no pending verification submissions.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/kyc">View All Verifications</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function FinancialCard() {
  return (
    <Card className="border-primary bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle>Financials</CardTitle>
        <CardDescription className="text-primary-foreground/70">
          Escrow balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">₦85,000,000</p>
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs text-white/65">Revenue</p>
            <p className="text-xl font-semibold">₦12.4M</p>
          </div>
          <div>
            <p className="text-xs text-white/65">Commissions</p>
            <p className="text-xl font-semibold">₦4.2M</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersTable({
  users,
  page,
  pages,
  total,
  onPageChange,
}: {
  users: AdminUser[];
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all"
      ? users
      : users.filter(
          (user) => user.role.toLowerCase() === filter.replace(/s$/, ""),
        );
  return (
    <Card id="users" className="overflow-hidden py-0">
      <CardHeader className="border-b py-5">
        <CardTitle className="text-xl">User Management</CardTitle>
        <CardAction className="-mb-5">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList variant="line" className="h-auto gap-2">
              {userTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    userTabClassName,
                    filter === tab.value && "font-semibold text-primary",
                  )}
                >
                  <span>{tab.label}</span>
                  {filter === tab.value && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-[3px] bg-primary"
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-12 pl-5">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined date</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => {
              const verified = user.isVerified;
              const isVendor = user.role.toUpperCase() === "VENDOR";
              const initials = user.fullName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("");
              return (
                <TableRow key={user.id} className="h-[72px]">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminRoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-medium text-warning",
                        verified && "text-success",
                      )}
                    >
                      ● {verified ? "Verified" : "In Review"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        {isVendor ? "View Vendor" : "View User"}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between bg-surface/50 py-4 text-xs text-muted-foreground">
        <span>
          Showing {users.length ? (page - 1) * 4 + 1 : 0} to{" "}
          {Math.min(page * 4, total)} of {total} entries
        </span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft />
              </Button>
            </PaginationItem>
            {Array.from(
              { length: Math.min(pages, 3) },
              (_, index) => index + 1,
            ).map((number) => (
              <PaginationItem key={number}>
                <Button
                  variant={number === page ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => onPageChange(number)}
                >
                  {number}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={page >= pages}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}

export function AdminDashboardHome() {
  const router = useRouter();
  const ready = useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const [usersPage, setUsersPage] = useState(1);
  const dashboard = useAdminDashboard();
  const growthHistory = useAdminGrowthHistory();
  const adminUsers = useAdminUsers(usersPage);
  const activities = useAdminActivities(1, 100);
  const kycStats = useAdminKycStats();
  const kycRequests = useAdminKycRequests(1, "PENDING", "ALL");

  useEffect(() => {
    if (ready && (!isAuthenticated || (role !== "admin" && role !== "staff")))
      router.replace("/admin/login");
  }, [isAuthenticated, ready, role, router]);
  if (!ready || !isAuthenticated || (role !== "admin" && role !== "staff"))
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-6 py-10">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-52 w-full" />
      </main>
    );

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <div className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <AdminSidebar />
      </div>
      <DashboardHeader />
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-7">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Platform Overview
              </h1>
              {dashboard.isFetching && <Badge variant="outline">Syncing</Badge>}
            </div>
            <p className="mt-1 text-muted-foreground">
              Monitor and manage all activities happening across PropertyArk.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Welcome back, {user?.fullName || "Administrator"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-secondary text-secondary"
            >
              <Download data-icon="inline-start" />
              Generate Report
            </Button>
            <Button>
              <UserPlus data-icon="inline-start" />
              Add Admin
            </Button>
          </div>
        </section>
        {/* <section className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
            <CircleAlert className="shrink-0" />
            <p className="flex-1">
              Security Alert: Multiple failed logins detected from unrecognized
              IP in Ikeja.
            </p>
            <Button variant="link" size="sm" className="text-destructive">
              Details
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
            <Bell className="shrink-0" />
            <p className="flex-1">
              Platform Alert:{" "}
              {dashboard.data?.dashboardStats.pendingReviews ?? 0} listings
              require immediate review.
            </p>
            <Button variant="link" size="sm">
              Review now
            </Button>
          </div>
        </section> */}
        <section className="mt-5">
          <OverviewCards stats={dashboard.data?.dashboardStats} />
        </section>
        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)]">
          <div className="flex h-full min-w-0 flex-col gap-5">
            <GrowthChart
              data={dashboard.data?.growthRevenue}
              history={growthHistory.data}
            />
            <PropertiesTable properties={dashboard.data?.properties} />
          </div>
          <aside className="flex h-full flex-col gap-5">
            <ActivitiesCard
              activities={activities.data?.activities ?? []}
              loading={activities.isLoading}
            />
            <VerificationCard
              stats={kycStats.data}
              requests={kycRequests.data?.requests ?? []}
              loading={kycStats.isLoading || kycRequests.isLoading}
            />
            <FinancialCard />
          </aside>
        </section>
        <section className="mt-5">
          <UsersTable
            users={adminUsers.data?.users ?? []}
            page={adminUsers.data?.pagination.page ?? usersPage}
            pages={adminUsers.data?.pagination.pages ?? 1}
            total={adminUsers.data?.pagination.total ?? 0}
            onPageChange={setUsersPage}
          />
        </section>
      </main>
    </div>
  );
}
