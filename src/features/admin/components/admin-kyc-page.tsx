"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  Download,
  FileBadge,
  SearchCheck,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminKycRequests,
  useAdminKycStats,
} from "@/features/admin/hooks/use-admin-dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { AdminKycRequest, AdminKycStats } from "@/services/admin.service";
import { cn } from "@/lib/utils";

export function AdminKycPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const query = useAdminKycRequests(page, status, role);
  const stats = useAdminKycStats();
  const requests = query.data?.requests ?? [];

  function exportReport() {
    const csv = [
      ["Name", "Email", "Role", "Status", "Submitted"],
      ...requests.map((item) => [
        item.fullName,
        item.email,
        item.role,
        item.status,
        item.submittedAt,
      ]),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "propertyark-kyc-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              KYC Verification
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage and review identification documents for vendors and buyers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download data-icon="inline-start" />
              Export Report
            </Button>
            <Button disabled>
              <SearchCheck data-icon="inline-start" />
              Bulk Approve
            </Button>
          </div>
        </header>
        <KycStats stats={stats.data} loading={stats.isLoading} />
        <Card className="mt-8 overflow-hidden py-0">
          <CardHeader className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="ALL">All Requests</TabsTrigger>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                USER TYPE
              </span>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="USER">Users</SelectItem>
                    <SelectItem value="VENDOR">Vendors</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {query.isLoading ? (
              <Skeleton className="m-6 h-96" />
            ) : (
              <KycTable requests={requests} />
            )}
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
            <span>
              Showing {requests.length} of {query.data?.pagination.total ?? 0}{" "}
              requests
            </span>
            <div className="flex gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ‹
              </Button>
              <Button size="icon-sm">{page}</Button>
              <Button
                size="icon-sm"
                variant="outline"
                disabled={page >= (query.data?.pagination.pages ?? 1)}
                onClick={() => setPage(page + 1)}
              >
                ›
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </AdminWorkspace>
  );
}

const statConfig = [
  {
    key: "pending",
    label: "Pending Verification",
    icon: FileBadge,
    tone: "destructive",
  },
  {
    key: "rejected",
    label: "Flagged / Rejected",
    icon: AlertTriangle,
    tone: "warning",
  },
  {
    key: "verified",
    label: "Verified",
    icon: BadgeCheck,
    tone: "success",
  },
  {
    key: "verifiedToday",
    label: "Verified Today",
    icon: BadgeCheck,
    tone: "primary",
  },
  {
    key: "averageProcessingHours",
    label: "Avg. Processing Time",
    icon: Clock3,
    tone: "muted",
  },
] as const;
function KycStats({
  stats,
  loading,
}: {
  stats?: AdminKycStats;
  loading: boolean;
}) {
  return (
    <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {statConfig.map(({ key, label, icon: Icon, tone }) => (
        <Card key={key}>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-28" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-lg bg-primary/10 p-2 text-primary",
                      tone === "destructive" &&
                        "bg-destructive/10 text-destructive",
                      tone === "warning" && "bg-warning/10 text-warning",
                      tone === "success" && "bg-success/10 text-success",
                      tone === "muted" && "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-bold">
                  {stats?.[key] ?? 0}
                  {key === "averageProcessingHours" && (
                    <span className="ml-1 text-base">hrs</span>
                  )}
                </p>
                <div className="mt-5 h-1.5 rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function KycTable({ requests }: { requests: AdminKycRequest[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow>
            <TableHead className="pl-6">User</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((item) => (
            <TableRow key={item.id} className="h-20">
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {item.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{item.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {item.role.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  <FileBadge />
                  NIN
                </Badge>
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(item.submittedAt))}
              </TableCell>
              <TableCell>
                <KycStatus status={item.status} />
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Button size="sm" asChild>
                  <Link href={`/admin/kyc/${item.id}`}>Review Documents</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!requests.length && (
        <div className="flex min-h-64 items-center justify-center text-muted-foreground">
          No KYC requests match the selected filters.
        </div>
      )}
    </div>
  );
}

function KycStatus({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "font-medium text-warning",
        status === "VERIFIED" && "text-success",
        status === "REJECTED" && "text-destructive",
      )}
    >
      ● {status === "PENDING" ? "In Review" : status.toLowerCase()}
    </span>
  );
}
