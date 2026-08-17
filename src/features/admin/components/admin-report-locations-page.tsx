"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Building2, Eye, MapPinned, Search } from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { useAdminReportsAnalytics } from "@/features/admin/hooks/use-admin-reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReportLocation } from "@/services/admin-reports.service";
import { cn } from "@/lib/utils";

export function AdminReportLocationsPage() {
  const analyticsQuery = useAdminReportsAnalytics();
  const locations = useMemo(
    () => analyticsQuery.data?.locations ?? [],
    [analyticsQuery.data?.locations],
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const filteredLocations = useMemo(
    () =>
      locations.filter((item) =>
        item.location.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [locations, query],
  );
  const totalViews = locations.reduce((sum, item) => sum + item.views, 0);
  const topLocation = locations[0];
  const pageSize = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLocations.length / pageSize),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredLocations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/reports">
            <ArrowLeft data-icon="inline-start" /> Back to Reports
          </Link>
        </Button>

        <header className="mt-5">
          <h1 className="text-3xl font-semibold tracking-tight">
            Location Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explore listing coverage, audience activity, and performance by
            location.
          </p>
        </header>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <LocationStat
            label="Locations covered"
            value={locations.length.toLocaleString()}
            icon={MapPinned}
          />
          <LocationStat
            label="Location views"
            value={totalViews.toLocaleString()}
            icon={Eye}
          />
          <LocationStat
            label="Top market"
            value={topLocation?.location ?? "Not available"}
            icon={Building2}
          />
        </section>

        <section className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(430px,0.95fr)]">
          <LocationMap
            locations={filteredLocations}
            selected={selectedLocation}
            onSelect={setSelectedLocation}
          />
          <Card className="min-h-[640px] py-0">
            <CardHeader className="border-b py-5">
              <CardTitle>All Locations</CardTitle>
              <CardDescription>
                {filteredLocations.length} markets found
              </CardDescription>
              <CardAction>
                <InputGroup className="w-56">
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search location"
                  />
                </InputGroup>
              </CardAction>
            </CardHeader>
            <CardContent className="max-h-[560px] overflow-auto p-0">
              {analyticsQuery.isLoading ? (
                <div className="flex flex-col gap-3 p-5">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : filteredLocations.length ? (
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
                    {pageRows.map((location) => (
                      <TableRow
                        key={location.location}
                        className={cn(
                          "cursor-pointer",
                          selectedLocation === location.location &&
                            "bg-primary/5",
                        )}
                        onClick={() => setSelectedLocation(location.location)}
                      >
                        <TableCell className="font-medium">
                          {location.location}
                        </TableCell>
                        <TableCell>{location.listings}</TableCell>
                        <TableCell>{location.views.toLocaleString()}</TableCell>
                        <TableCell>
                          {location.successTransactions.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              location.performance >= 60
                                ? "default"
                                : "secondary"
                            }
                          >
                            {location.performance}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Empty className="min-h-96">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPinned />
                    </EmptyMedia>
                    <EmptyTitle>No locations found</EmptyTitle>
                    <EmptyDescription>
                      Try a different search or add properties with complete
                      location details.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
            {filteredLocations.length > 0 && (
              <CardFooter className="justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, filteredLocations.length)} of{" "}
                  {filteredLocations.length}
                </p>
                <AdminTablePagination
                  page={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </CardFooter>
            )}
          </Card>
        </section>
      </main>
    </AdminWorkspace>
  );
}

function LocationStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof MapPinned;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LocationMap({
  locations,
  selected,
  onSelect,
}: {
  locations: ReportLocation[];
  selected: string | null;
  onSelect: (location: string) => void;
}) {
  return (
    <Card className="min-h-[640px] bg-muted/30 py-0">
      <CardHeader className="border-b bg-card py-5">
        <CardTitle>Performance Map</CardTitle>
        <CardDescription>
          Select a marker to highlight its table record.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative min-h-[560px] overflow-hidden p-0">
        <svg
          viewBox="0 0 900 560"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="map-grid"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M64 0H0V64"
                fill="none"
                stroke="currentColor"
                strokeOpacity=".08"
              />
            </pattern>
          </defs>
          <rect width="900" height="560" fill="url(#map-grid)" />
          <path
            d="M-30 420 C120 330 180 445 330 330 S575 220 930 285"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".13"
            strokeWidth="18"
          />
          <path
            d="M80 -20 C155 125 265 150 390 95 S625 95 720 590"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".1"
            strokeWidth="10"
          />
          <path
            d="M10 165 C220 235 330 205 470 250 S690 390 920 405"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".08"
            strokeWidth="6"
          />
        </svg>
        {locations.map((location, index) => {
          const point = mapPoint(location.location, index);
          const active = selected === location.location;
          return (
            <button
              key={location.location}
              type="button"
              aria-label={`Select ${location.location}`}
              onClick={() => onSelect(location.location)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-lg transition-transform hover:scale-110",
                active ? "size-8 scale-110" : "size-5",
              )}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span className="sr-only">{location.location}</span>
            </button>
          );
        })}
        <div className="absolute bottom-5 left-5 max-w-72 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selected market
          </p>
          <p className="mt-1 font-semibold">
            {selected ??
              topMapLocation(locations)?.location ??
              "Select a marker"}
          </p>
          {selected && (
            <p className="mt-1 text-sm text-muted-foreground">
              {locations.find((item) => item.location === selected)?.listings ??
                0}{" "}
              active listings in this market.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function mapPoint(value: string, index: number) {
  const hash = [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return {
    x: 12 + ((hash * 17 + index * 29) % 76),
    y: 13 + ((hash * 11 + index * 23) % 68),
  };
}

function topMapLocation(locations: ReportLocation[]) {
  return locations[0];
}
