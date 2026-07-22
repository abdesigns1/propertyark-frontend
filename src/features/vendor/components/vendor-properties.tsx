"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  CircleEllipsis,
  Eye,
  FilePenLine,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
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
import type { PropertyApiItem } from "@/features/properties/types/api";
import { useVendorProperties } from "@/features/vendor/hooks/use-vendor-properties";
import { getApiErrorMessage } from "@/services/api-error";
import { propertyService } from "@/services/property.service";
import {
  getPropertyDrafts,
  type PropertyDraft,
} from "@/features/vendor/lib/property-drafts";

const PAGE_SIZE = 6;
const EMPTY_PROPERTIES: PropertyApiItem[] = [];
type ListingStatus = "published" | "pending" | "draft" | "rejected";
type DraftValues = {
  name?: string;
  description?: string;
  type?: string;
  listingType?: string;
  price?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  size?: string;
  sizeUnit?: string;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string[];
};

function draftAsProperty(draft: PropertyDraft<DraftValues>): PropertyApiItem {
  const values = draft.values;
  const amount = Number(values.price) || 0;
  const listingType = values.listingType || "FOR_SALE";
  return {
    id: `draft:${draft.id}`,
    name: values.name?.trim() || "Untitled property",
    description: values.description || "Incomplete property draft",
    type: values.type || "RESIDENTIAL",
    listingType,
    status: "DRAFT",
    rentAmount: listingType === "FOR_RENT" ? amount : null,
    salePrice: listingType === "FOR_SALE" ? amount : null,
    landFee: listingType === "FOR_LAND" ? amount : null,
    shortletAmount: listingType === "FOR_SHORTLET" ? amount : null,
    address: values.address || "",
    city: values.city || "",
    state: values.state || "",
    country: values.country || "Nigeria",
    size: Number(values.size) || 0,
    sizeUnit: values.sizeUnit,
    bedrooms: Number(values.bedrooms) || 0,
    bathrooms: Number(values.bathrooms) || 0,
    amenities: values.amenities || [],
    vendorId: "local",
    createdAt: draft.updatedAt,
  };
}

function price(property: PropertyApiItem) {
  const amount =
    property.listingType === "FOR_RENT"
      ? property.rentAmount
      : property.listingType === "FOR_LAND"
        ? property.landFee
        : property.listingType === "FOR_SHORTLET"
          ? property.shortletAmount
          : property.salePrice;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function statusOf(property: PropertyApiItem): {
  key: ListingStatus;
  label: string;
} {
  const raw = (
    property.approvalStatus ||
    property.status ||
    "PENDING_REVIEW"
  ).toUpperCase();
  if (["AVAILABLE", "APPROVED", "PUBLISHED"].includes(raw))
    return { key: "published", label: "Published" };
  if (raw.includes("DRAFT")) return { key: "draft", label: "Draft" };
  if (["REJECTED", "DECLINED"].includes(raw))
    return { key: "rejected", label: "Rejected" };
  return { key: "pending", label: "Pending review" };
}

function imageOf(property: PropertyApiItem) {
  return (
    [...(property.media ?? [])]
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      .find((item) => item.type === "IMAGE")?.url ??
    "/assets/images/hero-property.jpeg"
  );
}

function statusVariant(
  key: string,
): "default" | "secondary" | "outline" | "destructive" {
  if (key === "published") return "default";
  if (key === "rejected") return "destructive";
  return key === "pending" ? "secondary" : "outline";
}

function StatCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: number;
  note: string;
  icon: typeof Building2;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="uppercase">{title}</CardDescription>
        <CardAction>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function VendorProperties() {
  const query = useVendorProperties();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<PropertyApiItem | null>(
    null,
  );
  const [draftProperties, setDraftProperties] = useState<PropertyApiItem[]>([]);
  useEffect(() => {
    const load = async () => {
      const drafts = await getPropertyDrafts<DraftValues>();
      queueMicrotask(() => setDraftProperties(drafts.map(draftAsProperty)));
    };
    void load();
    window.addEventListener("propertyark:drafts-changed", load);
    const timer = window.setInterval(load, 60_000);
    return () => {
      window.removeEventListener("propertyark:drafts-changed", load);
      window.clearInterval(timer);
    };
  }, []);
  const backendProperties = query.data?.properties ?? EMPTY_PROPERTIES;
  const properties = useMemo(
    () => [...draftProperties, ...backendProperties],
    [draftProperties, backendProperties],
  );
  const cities = useMemo(
    () =>
      [
        ...new Set(properties.map((property) => property.city).filter(Boolean)),
      ].sort(),
    [properties],
  );
  const counts = useMemo(
    () =>
      properties.reduce(
        (result, property) => {
          result[statusOf(property).key] += 1;
          return result;
        },
        { published: 0, pending: 0, draft: 0, rejected: 0 },
      ),
    [properties],
  );
  const filtered = useMemo(
    () =>
      properties.filter((property) => {
        const term = search.trim().toLocaleLowerCase();
        const propertyStatus = statusOf(property).key;
        return (
          (!term ||
            [
              property.name,
              property.address,
              property.city,
              property.state,
              property.id,
            ].some((value) => value?.toLocaleLowerCase().includes(term))) &&
          (status === "all" || propertyStatus === status) &&
          (type === "all" || property.type === type) &&
          (city === "all" || property.city === city)
        );
      }),
    [properties, search, status, type, city],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setCity("all");
    setPage(1);
  };
  const remove = useMutation({
    mutationFn: propertyService.remove,
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({
        queryKey: ["vendor", "properties"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["vendor", "dashboard"],
      });
      toast.success("Property deleted.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The property could not be deleted."),
      ),
  });

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Properties
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage, update, and monitor all your listed properties.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/vendor/properties/new">
            <Plus data-icon="inline-start" />
            Add New Property
          </Link>
        </Button>
      </header>
      <section
        aria-label="Property totals"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total properties"
          value={properties.length}
          note="All listings"
          icon={Building2}
        />
        <StatCard
          title="Published"
          value={counts.published}
          note="Active now"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending review"
          value={counts.pending}
          note="Awaiting approval"
          icon={CircleEllipsis}
        />
        <StatCard
          title="Draft"
          value={counts.draft}
          note="Incomplete"
          icon={FilePenLine}
        />
      </section>
      <Card>
        <CardContent className="grid gap-3 py-1 md:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              className="pl-9"
              placeholder="Search properties..."
              aria-label="Search properties"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              resetPage();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              resetPage();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Type: All</SelectItem>
                {[
                  "RESIDENTIAL",
                  "COMMERCIAL",
                  "INDUSTRIAL",
                  "LAND",
                  "MIXED_USE",
                ].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.replaceAll("_", " ").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={city}
            onValueChange={(value) => {
              setCity(value);
              resetPage();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All locations</SelectItem>
                {cities.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={clearFilters}>
            Clear all
          </Button>
        </CardContent>
      </Card>
      <Card className="min-h-[560px]">
        <CardContent className="px-0">
          {query.isLoading ? (
            <div className="flex min-h-[500px] flex-col gap-4 p-6">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : query.isError ? (
            <Empty className="min-h-[500px]">
              <EmptyHeader>
                <EmptyTitle>We couldn’t refresh your properties</EmptyTitle>
                <EmptyDescription>
                  The property service is temporarily unavailable. Please try
                  again.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => query.refetch()}>
                    Try again
                  </Button>
                  <Button asChild>
                    <Link href="/vendor/properties/new">Add Property</Link>
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : visible.length === 0 ? (
            <Empty className="min-h-[500px]">
              <EmptyHeader>
                <EmptyTitle>
                  {properties.length
                    ? "No properties match these filters"
                    : "You haven’t added a property yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {properties.length
                    ? "Clear or adjust the filters to see more listings."
                    : "Add your first property to start receiving inquiries."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {properties.length ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/vendor/properties/new">
                      <Plus data-icon="inline-start" />
                      Add Property
                    </Link>
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead className="pl-6">Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((property) => {
                    const propertyStatus = statusOf(property);
                    return (
                      <TableRow key={property.id} className="h-24">
                        <TableCell className="pl-6">
                          <div className="flex min-w-56 items-center gap-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={imageOf(property)}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-52 truncate font-medium">
                                {property.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ref: {property.id.slice(0, 10).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="min-w-28">
                            {property.city || "—"}
                            <br />
                            {property.state || property.country}
                          </p>
                        </TableCell>
                        <TableCell className="font-medium">
                          {price(property)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {property.type.replaceAll("_", " ").toLowerCase()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(propertyStatus.key)}>
                            {propertyStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(
                            property.viewCount ??
                            property.views ??
                            0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {(
                            property.inquiryCount ??
                            property.leads ??
                            0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${property.name}`}
                              >
                                <MoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                  <Link href={`/properties/${property.id}`}>
                                    <Eye />
                                    View listing
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <FilePenLine />
                                  Edit property
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  disabled={remove.isPending}
                                  onSelect={() => setDeleteTarget(property)}
                                >
                                  <Trash2 />
                                  Delete property
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {visible.length > 0 && (
          <div className="flex flex-col gap-3 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} entries
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                ‹
              </Button>
              {Array.from({ length: pages }, (_, index) => index + 1)
                .slice(Math.max(0, currentPage - 3), Math.max(3, currentPage))
                .map((number) => (
                  <Button
                    key={number}
                    variant={number === currentPage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </Button>
                ))}
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === pages}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </Card>
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete property?</DialogTitle>
            <DialogDescription>
              “{deleteTarget?.name}” will be permanently removed from your
              listings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={remove.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={remove.isPending || !deleteTarget}
              onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}
            >
              {remove.isPending ? "Deleting..." : "Delete property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
