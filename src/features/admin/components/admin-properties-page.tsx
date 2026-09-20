"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Download, Eye, Plus, Search, StarOff } from "lucide-react";
import { toast } from "sonner";
import { AdminPropertyStats } from "@/features/admin/components/admin-property-stats";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminFeaturedProperties,
  useAdminProperties,
} from "@/features/admin/hooks/use-admin-dashboard";
import { useAdminCreditSettings } from "@/features/admin/hooks/use-admin-credit";
import { showPropertyImageFallback } from "@/features/properties/utils/normalize-property-response";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminManagedProperty } from "@/services/admin.service";
import { DEFAULT_CREDIT_SETTINGS } from "@/services/admin-credit.service";
import { getApiErrorMessage } from "@/services/api-error";
import { propertyService } from "@/services/property.service";
import type { PropertyApiItem } from "@/features/properties/types/api";
import { cn } from "@/lib/utils";

export function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [priceRange, setPriceRange] = useState("ALL");
  const [featured, setFeatured] = useState("ALL");
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<AdminManagedProperty | null>(
    null,
  );
  const isSearching = Boolean(search.trim());
  const isWideQuery = isSearching || featured !== "ALL";
  const query = useAdminProperties(
    isWideQuery ? 1 : page,
    status,
    isWideQuery ? 1000 : 10,
  );
  const statsQuery = useAdminProperties(1, "ALL");
  const featuredQuery = useAdminFeaturedProperties();
  const creditSettings = useAdminCreditSettings();
  const featureCost =
    creditSettings.data?.featurePropertyCost ??
    DEFAULT_CREDIT_SETTINGS.featurePropertyCost;
  const data = query.data;
  const featuredItems = useMemo(
    () => featuredQuery.data ?? [],
    [featuredQuery.data],
  );
  const featuredById = useMemo(
    () => new Map(featuredItems.map((property) => [property.id, property])),
    [featuredItems],
  );
  const properties = useMemo(() => {
    const regular = (data?.properties ?? []).map((property) => {
      const feature = featuredById.get(property.id);
      return feature
        ? {
            ...property,
            isFeatured: true,
            featuredAt: feature.featuredAt,
            featuredUntil: feature.featuredUntil,
            featureExpiresAt: feature.featureExpiresAt,
          }
        : property;
    });
    const source =
      featured === "FEATURED"
        ? featuredItems.map(toAdminManagedProperty)
        : regular;
    return filterProperties(source, {
      search,
      category,
      priceRange,
      featured,
    });
  }, [
    category,
    data?.properties,
    featured,
    featuredById,
    featuredItems,
    priceRange,
    search,
  ]);
  const expiringSoon = featuredItems.filter(
    (property) => featuredPlacementState(property) === "EXPIRING_SOON",
  ).length;

  const removeFeatured = useMutation({
    mutationFn: (property: AdminManagedProperty) =>
      propertyService.unfeature(property.id, featureCost),
    onSuccess: async () => {
      setRemoveTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "properties"] }),
        queryClient.invalidateQueries({ queryKey: ["properties", "featured"] }),
        queryClient.invalidateQueries({
          queryKey: ["properties", "available"],
        }),
      ]);
      toast.success("Featured placement removed.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Featured placement could not be removed."),
      ),
  });

  function exportCsv() {
    const rows = properties.map((property) => [
      property.name,
      property.vendor?.fullName ?? "",
      adminPropertyPrice(property),
      adminPropertyCategory(property),
      property.createdAt,
      property.listingStatus ?? "PENDING",
      property.status ?? "AVAILABLE",
    ]);
    const csv = [
      [
        "Property",
        "Vendor",
        "Price",
        "Category",
        "Date Listed",
        "Approval Status",
        "Property Status",
      ],
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
            loading={statsQuery.isLoading || featuredQuery.isLoading}
            featuredCount={featuredItems.length}
          />
        </section>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border bg-primary/5 px-5 py-4 text-sm">
          <BadgeCheck className="size-5 text-primary" />
          <span className="font-medium">Featured placement monitor</span>
          <Badge variant="outline" className="bg-background">
            {featuredItems.length} active
          </Badge>
          <Badge
            variant="outline"
            className="border-warning/25 bg-warning/10 text-warning"
          >
            {expiringSoon} expiring within 7 days
          </Badge>
        </div>

        <Card className="mt-9 overflow-hidden py-0">
          <CardContent className="p-0">
            <PropertyFilters
              search={search}
              setSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              status={status}
              setStatus={(value) => {
                setStatus(value);
                setPage(1);
              }}
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              featured={featured}
              setFeatured={(value) => {
                setFeatured(value);
                setPage(1);
              }}
            />
            {query.isLoading || featuredQuery.isLoading ? (
              <Skeleton className="h-[620px] w-full rounded-none" />
            ) : (
              <PropertiesTable
                properties={properties}
                featureCost={featureCost}
                onRemoveFeatured={setRemoveTarget}
              />
            )}
            <PropertyPagination
              page={isWideQuery ? 1 : (data?.pagination.page ?? page)}
              pages={isWideQuery ? 1 : (data?.pagination.pages ?? 1)}
              total={
                isWideQuery ? properties.length : (data?.pagination.total ?? 0)
              }
              count={properties.length}
              pageSize={isWideQuery ? Math.max(1, properties.length) : 10}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>

        <Dialog
          open={Boolean(removeTarget)}
          onOpenChange={(open) => !open && setRemoveTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove featured placement?</DialogTitle>
              <DialogDescription>
                {removeTarget?.name} will immediately lose its featured badge
                and priority placement.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoveTarget(null)}
                disabled={removeFeatured.isPending}
              >
                Keep featured
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  removeTarget && removeFeatured.mutate(removeTarget)
                }
                disabled={removeFeatured.isPending}
              >
                {removeFeatured.isPending ? <Spinner /> : <StarOff />}
                Remove featured
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  featured,
  setFeatured,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
  featured: string;
  setFeatured: (value: string) => void;
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
        <FilterSelect
          value={featured}
          onValueChange={setFeatured}
          placeholder="All Placements"
          items={["ALL", "FEATURED", "NOT_FEATURED"]}
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
  featureCost,
  onRemoveFeatured,
}: {
  properties: AdminManagedProperty[];
  featureCost: number;
  onRemoveFeatured: (property: AdminManagedProperty) => void;
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
            <TableHead>Approval</TableHead>
            <TableHead>Property Status</TableHead>
            <TableHead>Featured placement</TableHead>
            <TableHead className="pr-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <PropertyRow
              key={property.id}
              property={property}
              featureCost={featureCost}
              onRemoveFeatured={onRemoveFeatured}
            />
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

function PropertyRow({
  property,
  featureCost,
  onRemoveFeatured,
}: {
  property: AdminManagedProperty;
  featureCost: number;
  onRemoveFeatured: (property: AdminManagedProperty) => void;
}) {
  const approvalStatus = (property.listingStatus || "PENDING").toUpperCase();
  const propertyStatus = (property.status || "AVAILABLE").toUpperCase();
  return (
    <TableRow className="h-[110px]">
      <TableCell className="pl-6">
        <div className="flex min-w-56 items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={adminPropertyImage(property)}
              alt={property.name}
              fill
              crossOrigin="anonymous"
              unoptimized
              onError={(event) =>
                showPropertyImageFallback(event.currentTarget)
              }
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{property.name}</p>
              {property.isFeatured && (
                <Badge className="gap-1 bg-primary text-primary-foreground">
                  <BadgeCheck className="size-3" /> Featured
                </Badge>
              )}
            </div>
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
        <StatusBadge status={approvalStatus} />
      </TableCell>
      <TableCell>
        <PropertyStatusBadge status={propertyStatus} />
      </TableCell>
      <TableCell>
        <FeaturedPlacement property={property} featureCost={featureCost} />
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="flex justify-end gap-2">
          {property.isFeatured && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemoveFeatured(property)}
            >
              <StarOff /> Remove
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/properties/${property.id}`}>
              <Eye data-icon="inline-start" />
              View Details
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function PropertyStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "AVAILABLE" &&
          "border-success/20 bg-success/10 text-success",
        ["SOLD", "RENTED", "OCCUPIED"].includes(status) &&
          "border-primary/20 bg-primary/10 text-primary",
        ["UNDER_MAINTENANCE", "UNDER_CONSTRUCTION"].includes(status) &&
          "border-warning/20 bg-warning/10 text-warning",
      )}
    >
      {status === "AVAILABLE"
        ? "Available / Active"
        : status.replaceAll("_", " ").toLowerCase()}
    </Badge>
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

function FeaturedPlacement({
  property,
  featureCost,
}: {
  property: AdminManagedProperty;
  featureCost: number;
}) {
  if (!property.isFeatured) {
    return <span className="text-sm text-muted-foreground">Not featured</span>;
  }

  const state = featuredPlacementState(property);
  const started = property.featuredAt;
  const expiry = property.featuredUntil ?? property.featureExpiresAt;
  const points =
    property.pointsCharged ?? property.featurePoints ?? featureCost;

  return (
    <div className="min-w-40 space-y-1.5">
      <Badge
        variant="outline"
        className={cn(
          "gap-1",
          state === "ACTIVE" && "border-success/20 bg-success/10 text-success",
          state === "EXPIRING_SOON" &&
            "border-warning/20 bg-warning/10 text-warning",
          state === "EXPIRED" &&
            "border-destructive/20 bg-destructive/10 text-destructive",
        )}
      >
        <BadgeCheck className="size-3" />
        {state === "EXPIRING_SOON" ? "Expiring soon" : state.toLowerCase()}
      </Badge>
      {started && (
        <p className="text-xs text-muted-foreground">
          Started {formatAdminDate(started)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {expiry ? `Ends ${formatAdminDate(expiry)}` : "No expiry returned"}
      </p>
      <p className="text-xs text-muted-foreground">{points} points</p>
    </div>
  );
}

function PropertyPagination({
  page,
  pages,
  total,
  count,
  pageSize,
  onPageChange,
}: {
  page: number;
  pages: number;
  total: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const first = count ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min((page - 1) * pageSize + count, total);
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
  filters: {
    search: string;
    category: string;
    priceRange: string;
    featured: string;
  },
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
      `${property.id} ${property.name} ${property.type} ${property.listingType} ${property.listingStatus ?? ""} ${property.status ?? ""} ${property.address} ${property.city} ${property.state} ${property.vendor?.id ?? ""} ${property.vendor?.fullName ?? ""} ${property.vendor?.email ?? ""}`
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
    const matchesFeatured =
      filters.featured === "ALL" ||
      (filters.featured === "FEATURED" && property.isFeatured) ||
      (filters.featured === "NOT_FEATURED" && !property.isFeatured);
    return matchesSearch && matchesCategory && matchesPrice && matchesFeatured;
  });
}

function toAdminManagedProperty(
  property: PropertyApiItem,
): AdminManagedProperty {
  return {
    ...property,
    listingStatus: property.listingStatus ?? "ACTIVE",
    media: property.media,
    isFeatured: true,
  };
}

function featuredPlacementState(
  property: Pick<
    AdminManagedProperty | PropertyApiItem,
    "featuredUntil" | "featureExpiresAt"
  >,
) {
  const expiry = property.featuredUntil ?? property.featureExpiresAt;
  if (!expiry) return "ACTIVE" as const;
  const remaining = new Date(expiry).getTime() - Date.now();
  if (remaining <= 0) return "EXPIRED" as const;
  if (remaining <= 7 * 24 * 60 * 60 * 1000) return "EXPIRING_SOON" as const;
  return "ACTIVE" as const;
}

function formatAdminDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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
    FEATURED: "Featured",
    NOT_FEATURED: "Not Featured",
  };
  return labels[value] ?? value;
}
