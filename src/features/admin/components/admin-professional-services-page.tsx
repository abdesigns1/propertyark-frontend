"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  FileText,
  Search,
  Trash2,
} from "lucide-react";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { ProfessionalServiceDeleteDialog } from "@/features/admin/components/professional-service-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
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
import { useAdminProfessionalServices } from "@/features/professional-services/hooks/use-professional-services";
import {
  formatProfessionalServiceDate,
  PROFESSIONAL_SERVICE_OPTIONS,
  professionalServiceLabel,
} from "@/features/professional-services/lib/professional-service-options";
import type {
  ProfessionalServiceRequest,
  ProfessionalServiceType,
} from "@/services/professional-service.service";

const PAGE_SIZE = 10;

export function AdminProfessionalServicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState<
    "ALL" | ProfessionalServiceType
  >("ALL");
  const [requestToDelete, setRequestToDelete] =
    useState<ProfessionalServiceRequest | null>(null);
  const query = useAdminProfessionalServices();
  const requests = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return [...(query.data ?? [])]
      .filter((request) => {
        const matchesService =
          serviceType === "ALL" || request.serviceType === serviceType;
        const searchable = [
          request.phone,
          request.propertyReference,
          request.message,
          request.requester.name,
          request.requester.email,
          professionalServiceLabel(request.serviceType),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return matchesService && (!term || searchable.includes(term));
      })
      .sort(
        (first, second) =>
          dateValue(second.createdAt) - dateValue(first.createdAt),
      );
  }, [query.data, search, serviceType]);
  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleRequests = requests.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Professional Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review consultation requests and their supporting documents.
          </p>
        </header>

        <ServiceStats requests={query.data ?? []} loading={query.isLoading} />

        <Card className="mt-9 overflow-hidden py-0">
          <CardHeader className="gap-4 border-b bg-surface/50 py-5 lg:grid-cols-[minmax(220px,1fr)_220px] lg:items-end">
            <div>
              <CardTitle>Service requests</CardTitle>
              <CardDescription className="mt-1">
                {requests.length.toLocaleString("en-NG")} matching records
              </CardDescription>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-[minmax(260px,1fr)_220px]">
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  placeholder="Search phone, requester, property or message"
                  aria-label="Search professional service requests"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>
              <Select
                value={serviceType}
                onValueChange={(value) => {
                  setServiceType(value as "ALL" | ProfessionalServiceType);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ALL">All services</SelectItem>
                    {PROFESSIONAL_SERVICE_OPTIONS.map((option) => (
                      <SelectItem key={option.apiValue} value={option.apiValue}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {query.isLoading ? (
              <RequestTableSkeleton />
            ) : query.isError ? (
              <Empty className="min-h-80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BriefcaseBusiness />
                  </EmptyMedia>
                  <EmptyTitle>Requests could not be loaded</EmptyTitle>
                  <EmptyDescription>
                    Check the API connection and try loading the requests again.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    onClick={() => void query.refetch()}
                  >
                    Try again
                  </Button>
                </EmptyContent>
              </Empty>
            ) : visibleRequests.length ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Consultation</TableHead>
                      <TableHead>Property reference</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <p className="font-medium">
                            {request.requester.name ||
                              request.phone ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.requester.email ||
                              request.phone ||
                              "No contact"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {professionalServiceLabel(request.serviceType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatProfessionalServiceDate(
                            request.consultationDate,
                          )}
                        </TableCell>
                        <TableCell>
                          {request.propertyReference || "Not provided"}
                        </TableCell>
                        <TableCell>
                          {request.documents.length.toLocaleString("en-NG")}
                        </TableCell>
                        <TableCell>
                          {formatProfessionalServiceDate(request.createdAt, {
                            includeTime: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/admin/professional-services/${request.id}`}
                              >
                                <Eye data-icon="inline-start" />
                                View
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${professionalServiceLabel(request.serviceType)} request`}
                              onClick={() => setRequestToDelete(request)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Empty className="min-h-80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No professional service requests</EmptyTitle>
                  <EmptyDescription>
                    New submissions from the public Professional Services page
                    will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          {!query.isLoading && !query.isError && requests.length > 0 && (
            <CardFooter className="justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </p>
              <AdminTablePagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </CardFooter>
          )}
        </Card>
      </main>

      <ProfessionalServiceDeleteDialog
        request={requestToDelete}
        open={Boolean(requestToDelete)}
        onOpenChange={(open) => {
          if (!open) setRequestToDelete(null);
        }}
      />
    </AdminWorkspace>
  );
}

function ServiceStats({
  requests,
  loading,
}: {
  requests: ProfessionalServiceRequest[];
  loading: boolean;
}) {
  const cards = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: BriefcaseBusiness,
    },
    ...PROFESSIONAL_SERVICE_OPTIONS.map((option) => ({
      label: option.label,
      value: requests.filter(
        (request) => request.serviceType === option.apiValue,
      ).length,
      icon: CalendarDays,
    })),
  ];

  return (
    <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <AdminStatCard
          key={card.label}
          label={card.label}
          value={card.value}
          note="Submitted requests"
          icon={card.icon}
          loading={loading}
        />
      ))}
    </section>
  );
}

function RequestTableSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

function dateValue(value: string | null) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}
