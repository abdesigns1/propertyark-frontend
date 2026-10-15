"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { ProfessionalServiceDeleteDialog } from "@/features/admin/components/professional-service-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProfessionalService } from "@/features/professional-services/hooks/use-professional-services";
import {
  formatProfessionalServiceDate,
  professionalServiceLabel,
} from "@/features/professional-services/lib/professional-service-options";

export function AdminProfessionalServiceDetailsPage({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const query = useAdminProfessionalService(requestId);
  const request = query.data;

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/professional-services">
            <ArrowLeft data-icon="inline-start" />
            Back to requests
          </Link>
        </Button>

        {query.isLoading ? (
          <DetailsSkeleton />
        ) : query.isError || !request ? (
          <Empty className="mt-8 min-h-96 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BriefcaseBusiness />
              </EmptyMedia>
              <EmptyTitle>Request could not be loaded</EmptyTitle>
              <EmptyDescription>
                The request may have been removed or is temporarily unavailable.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => void query.refetch()}>
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {professionalServiceLabel(request.serviceType)} Request
                  </h1>
                  <Badge variant="secondary">
                    {professionalServiceLabel(request.serviceType)}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Submitted{" "}
                  {formatProfessionalServiceDate(request.createdAt, {
                    includeTime: true,
                  })}
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 data-icon="inline-start" />
                Delete request
              </Button>
            </header>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation brief</CardTitle>
                    <CardDescription>
                      Information submitted with this professional service
                      request.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {request.message || "No service brief was provided."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supporting documents</CardTitle>
                    <CardDescription>
                      Files uploaded by the requester for review.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {request.documents.length ? (
                      <div className="flex flex-col gap-3">
                        {request.documents.map((document) => (
                          <div
                            key={document.id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {document.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {document.mimeType || "Uploaded document"}
                              </p>
                            </div>
                            {document.url ? (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={document.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download data-icon="inline-start" />
                                  Open
                                </a>
                              </Button>
                            ) : (
                              <Badge variant="outline">Unavailable</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty className="min-h-56">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <FileText />
                          </EmptyMedia>
                          <EmptyTitle>No supporting documents</EmptyTitle>
                          <EmptyDescription>
                            The requester did not attach any files.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Request details</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <DetailItem
                      icon={CalendarDays}
                      label="Preferred consultation"
                      value={formatProfessionalServiceDate(
                        request.consultationDate,
                        { includeTime: true },
                      )}
                    />
                    <Separator />
                    <DetailItem
                      icon={MapPin}
                      label="Property reference"
                      value={request.propertyReference || "Not provided"}
                    />
                    <Separator />
                    <DetailItem
                      icon={FileText}
                      label="Documents"
                      value={`${request.documents.length} attached`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requester</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <DetailItem
                      icon={UserRound}
                      label="Name"
                      value={request.requester.name || "Not provided"}
                    />
                    <Separator />
                    <DetailItem
                      icon={Phone}
                      label="Phone"
                      value={request.phone || "Not provided"}
                      href={request.phone ? `tel:${request.phone}` : undefined}
                    />
                    <Separator />
                    <DetailItem
                      icon={Mail}
                      label="Email"
                      value={request.requester.email || "Not provided"}
                      href={
                        request.requester.email
                          ? `mailto:${request.requester.email}`
                          : undefined
                      }
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <ProfessionalServiceDeleteDialog
              request={request}
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onDeleted={() => router.replace("/admin/professional-services")}
            />
          </>
        )}
      </main>
    </AdminWorkspace>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>
    </>
  );

  return href ? (
    <a href={href} className="flex gap-3 hover:underline">
      {content}
    </a>
  ) : (
    <div className="flex gap-3">{content}</div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-5">
      <Skeleton className="h-16 w-full max-w-xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
