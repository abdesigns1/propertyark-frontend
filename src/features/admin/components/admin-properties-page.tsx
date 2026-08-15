"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Eye, Plus, Search } from "lucide-react";
import { AdminPropertyStats } from "@/features/admin/components/admin-property-stats";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { useAdminProperties } from "@/features/admin/hooks/use-admin-dashboard";
import {
  adminPropertyCategory,
  adminPropertyImage,
  adminPropertyLocation,
  adminPropertyPrice,
} from "@/features/admin/lib/admin-property-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { AdminManagedProperty } from "@/services/admin.service";
import { cn } from "@/lib/utils";

export function AdminPropertiesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [priceRange, setPriceRange] = useState("ALL");
  const [search, setSearch] = useState("");
  const query = useAdminProperties(page, status);
  const statsQuery = useAdminProperties(1, "ALL");
  const data = query.data;
  const properties = useMemo(
    () =>
      filterProperties(data?.properties ?? [], {
        search,
        category,
        priceRange,
      }),
    [category, data?.properties, priceRange, search],
  );

  function exportCsv() {
    const rows = properties.map((property) => [
      property.name,
      property.vendor?.fullName ?? "",
      adminPropertyPrice(property),
      adminPropertyCategory(property),
      property.createdAt,
      property.listingStatus,
    ]);
    const csv = [
      ["Property", "Vendor", "Price", "Category", "Date Listed", "Status"],
      ...rows,
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
    anchor.download = `propertyark-properties-${page}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Property Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Monitor, review, and moderate all property listings on the
              platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={!properties.length}
            >
              <Download data-icon="inline-start" /> Export CSV
            </Button>
            <Button disabled title="Property creation is currently vendor-only">
              <Plus data-icon="inline-start" /> Add New Property
            </Button>
          </div>
        </header>

        <section className="mt-8">
          <AdminPropertyStats
            stats={statsQuery.data?.stats}
            loading={statsQuery.isLoading}
          />
        </section>

        <Card className="mt-9 overflow-hidden py-0">
          <CardContent className="p-0">
            <PropertyFilters
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={(value) => {
                setStatus(value);
                setPage(1);
              }}
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
            {query.isLoading ? (
              <Skeleton className="h-[620px] w-full rounded-none" />
            ) : (
              <PropertiesTable properties={properties} />
            )}
            <PropertyPagination
              page={data?.pagination.page ?? page}
              pages={data?.pagination.pages ?? 1}
              total={data?.pagination.total ?? 0}
              count={properties.length}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </main>
    </AdminWorkspace>
  );
}

function PropertyFilters({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  priceRange,
  setPriceRange,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b p-5 xl:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, ID or vendor..."
          className="h-10 pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          placeholder="All Status"
          items={["ALL", "ACTIVE", "PENDING", "REJECTED"]}
        />
        <FilterSelect
          value={category}
          onValueChange={setCategory}
          placeholder="All Categories"
          items={["ALL", "FOR_SALE", "FOR_RENT", "FOR_LAND", "FOR_SHORTLET"]}
        />
        <FilterSelect
          value={priceRange}
          onValueChange={setPriceRange}
          placeholder="Price Range"
          items={["ALL", "UNDER_50M", "50M_200M", "OVER_200M"]}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onValueChange,
  placeholder,
  items,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: string[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 min-w-32">
        <SelectValue placeholder={placeholder}>
          {filterLabel(value, placeholder)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {filterLabel(item, placeholder)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function PropertiesTable({
  properties,
}: {
  properties: AdminManagedProperty[];
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow>
            <TableHead className="pl-6">Property</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Price (₦)</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date Listed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} />
          ))}
        </TableBody>
      </Table>
      {!properties.length && (
        <div className="flex min-h-72 items-center justify-center text-muted-foreground">
          No properties match the selected filters.
        </div>
      )}
    </div>
  );
}

function PropertyRow({ property }: { property: AdminManagedProperty }) {
  const status = (property.listingStatus || property.status).toUpperCase();
  return (
    <TableRow className="h-[110px]">
      <TableCell className="pl-6">
        <div className="flex min-w-56 items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={adminPropertyImage(property)}
              alt={property.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">{property.name}</p>
            <p className="max-w-44 truncate text-xs text-muted-foreground">
              {adminPropertyLocation(property)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="max-w-32 font-medium">
          {property.vendor?.fullName || "Unknown vendor"}
        </p>
        <Badge variant="secondary" className="mt-2">
          Vendor
        </Badge>
      </TableCell>
      <TableCell className="font-semibold">
        {adminPropertyPrice(property)}
      </TableCell>
      <TableCell className="capitalize">
        {adminPropertyCategory(property)}
      </TableCell>
      <TableCell>
        {new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(property.createdAt))}
      </TableCell>
      <TableCell>
        <StatusBadge status={status} />
      </TableCell>
      <TableCell className="pr-6 text-right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/properties/${property.id}`}>
            <Eye data-icon="inline-start" />
            View Details
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "ACTIVE" && "border-success/20 bg-success/10 text-success",
        status === "PENDING" && "border-warning/20 bg-warning/10 text-warning",
        status === "REJECTED" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      ● {status.toLowerCase()}
    </Badge>
  );
}

function PropertyPagination({
  page,
  pages,
  total,
  count,
  onPageChange,
}: {
  page: number;
  pages: number;
  total: number;
  count: number;
  onPageChange: (page: number) => void;
}) {
  const first = count ? (page - 1) * 10 + 1 : 0;
  const last = Math.min((page - 1) * 10 + count, total);
  return (
    <div className="flex flex-col gap-4 border-t px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {first}-{last} of {total.toLocaleString()} listings
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </Button>
        {Array.from(
          { length: Math.min(pages, 3) },
          (_, index) => index + 1,
        ).map((number) => (
          <Button
            key={number}
            variant={page === number ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => onPageChange(number)}
          >
            {number}
          </Button>
        ))}
        {pages > 3 && <span className="px-2">… {pages}</span>}
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </Button>
      </div>
    </div>
  );
}

function filterProperties(
  properties: AdminManagedProperty[],
  filters: { search: string; category: string; priceRange: string },
) {
  const search = filters.search.trim().toLowerCase();
  return properties.filter((property) => {
    const amount =
      property.salePrice ??
      property.rentAmount ??
      property.landFee ??
      property.shortletAmount ??
      0;
    const matchesSearch =
      !search ||
      `${property.name} ${property.id} ${property.vendor?.fullName ?? ""}`
        .toLowerCase()
        .includes(search);
    const matchesCategory =
      filters.category === "ALL" ||
      property.listingType.toUpperCase() === filters.category;
    const matchesPrice =
      filters.priceRange === "ALL" ||
      (filters.priceRange === "UNDER_50M" && amount < 50_000_000) ||
      (filters.priceRange === "50M_200M" &&
        amount >= 50_000_000 &&
        amount <= 200_000_000) ||
      (filters.priceRange === "OVER_200M" && amount > 200_000_000);
    return matchesSearch && matchesCategory && matchesPrice;
  });
}

function filterLabel(value: string, fallback: string) {
  const labels: Record<string, string> = {
    ALL: fallback,
    ACTIVE: "Active",
    PENDING: "Pending",
    REJECTED: "Rejected",
    FOR_SALE: "Sell",
    FOR_RENT: "Rent",
    FOR_LAND: "Land",
    FOR_SHORTLET: "Shortlet",
    UNDER_50M: "Under ₦50M",
    "50M_200M": "₦50M – ₦200M",
    OVER_200M: "Over ₦200M",
  };
  return labels[value] ?? value;
}
