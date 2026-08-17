"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Star,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  recentReportsMock,
  transactionFeedMock,
} from "@/features/admin/data/admin-reports-finance-mock";
import type {
  ReportCategory,
  ReportLocation,
} from "@/services/admin-reports.service";
import { cn } from "@/lib/utils";
import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";

const insightItems = [
  {
    icon: ArrowUpRight,
    text: "Property listings increased this month, driven by new developments across growing locations.",
    color: "text-emerald-200",
  },
  {
    icon: Star,
    text: "Luxury properties continue to attract the strongest buyer interest across the platform.",
    color: "text-amber-200",
  },
  {
    icon: TriangleAlert,
    text: "Transaction completion requires monitoring while finance integrations are being finalized.",
    color: "text-orange-200",
  },
];

export function InsightsCard({ periodLabel }: { periodLabel: string }) {
  return (
    <Card className="border-primary bg-primary text-primary-foreground shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="text-secondary" /> AI Insights
        </CardTitle>
        <CardDescription className="text-primary-foreground/70">
          Analysis for {periodLabel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insightItems.map((item) => (
          <div
            key={item.text}
            className="flex gap-3 rounded-lg border border-white/15 bg-white/10 p-4"
          >
            <item.icon className={cn("mt-0.5 size-5 shrink-0", item.color)} />
            <p className="text-sm leading-5">{item.text}</p>
          </div>
        ))}
        <Button className="w-full bg-white/20 text-white hover:bg-white/30">
          Full Analysis
        </Button>
      </CardContent>
    </Card>
  );
}

export function CategoryDistributionCard({
  categories,
}: {
  categories: ReportCategory[];
}) {
  const categoryColors: Record<string, string> = {
    Rent: "bg-blue-600",
    Land: "bg-orange-600",
    Shortlet: "bg-slate-600",
    "For Sale": "bg-amber-600",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map((category, index) => (
          <div key={category.label}>
            <div className="mb-2 flex justify-between text-sm">
              <span>{category.label}</span>
              <span className="font-medium">{category.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  categoryColors[category.label] ??
                    (index === 0 ? "bg-primary" : "bg-secondary"),
                )}
                style={{ width: `${category.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TopLocationsCard({
  locations,
}: {
  locations: ReportLocation[];
}) {
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(locations.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = locations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="flex-row items-center justify-between border-b py-5">
        <CardTitle>Top Performing Locations</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/reports/locations">
              View All Locations <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead>Location</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Success TXS</TableHead>
            <TableHead>Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.length ? (
            pageRows.map((row) => (
              <TableRow key={row.location}>
                <TableCell className="font-medium">{row.location}</TableCell>
                <TableCell>{row.listings.toLocaleString()}</TableCell>
                <TableCell>{row.views.toLocaleString()}</TableCell>
                <TableCell>
                  {row.successTransactions.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="h-1.5 min-w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        row.performance >= 60
                          ? "bg-emerald-500"
                          : "bg-secondary",
                      )}
                      style={{ width: `${row.performance}%` }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground"
              >
                No property locations are available yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {locations.length > 0 && (
        <CardFooter className="justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, locations.length)} of{" "}
            {locations.length} locations
          </p>
          <AdminTablePagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export function CustomReportCard() {
  const [format, setFormat] = useState("PDF");

  return (
    <Card id="custom-report">
      <CardHeader>
        <CardTitle>Generate Custom Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase">Report type</label>
          <Select defaultValue="revenue">
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                <SelectItem value="users">User Growth</SelectItem>
                <SelectItem value="properties">Property Performance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase">Format</p>
          <ToggleGroup
            type="single"
            value={format}
            onValueChange={(value) => value && setFormat(value)}
            className="grid h-11 w-full grid-cols-2 bg-transparent p-0"
          >
            <ToggleGroupItem value="PDF" className="border">
              <FileText /> PDF
            </ToggleGroupItem>
            <ToggleGroupItem value="CSV" className="border">
              <FileSpreadsheet /> CSV
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button
          className="w-full"
          onClick={() =>
            toast.info(
              `${format} report generation will be connected to the finance reporting endpoint.`,
            )
          }
        >
          Download Report
        </Button>
        <div className="border-t pt-5">
          <p className="mb-4 text-sm">Recent Reports</p>
          <div className="space-y-4">
            {recentReportsMock.map((report) => (
              <div key={report.name} className="flex items-center gap-3">
                {report.format === "PDF" ? (
                  <FileText className="text-destructive" />
                ) : (
                  <FileSpreadsheet className="text-emerald-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.meta}</p>
                </div>
                <ArrowDownToLine className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionFeedCard({
  items,
}: {
  items: ReadonlyArray<(typeof transactionFeedMock)[number]>;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="flex-row items-center justify-between border-b bg-muted/50 py-5">
        <CardTitle>Real-time Transaction Feed</CardTitle>
        <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 border-b px-6 py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {item.initials}
              </span>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <p className="font-mono text-sm font-semibold">
              ₦{item.amount.toLocaleString()}
            </p>
            <div className="flex min-w-44 items-center justify-between gap-5">
              <Badge
                className={
                  item.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }
              >
                {item.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
