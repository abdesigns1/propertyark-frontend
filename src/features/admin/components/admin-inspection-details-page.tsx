"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  History,
  MapPin,
  MoreVertical,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminInspection,
  useAdminProperty,
} from "@/features/admin/hooks/use-admin-dashboard";
import {
  initials,
  inspectionDateLabel,
  inspectionReference,
  inspectionStatusLabel,
  inspectionTimeLabel,
  inspectionTypeLabel,
} from "@/features/admin/lib/admin-inspection-display";
import { adminPropertyPrice } from "@/features/admin/lib/admin-property-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { VendorInspection } from "@/services/inspection.service";
import { cn } from "@/lib/utils";

export function AdminInspectionDetailsPage({
  inspectionId,
}: {
  inspectionId: string;
}) {
  const query = useAdminInspection(inspectionId);
  const inspection = query.data;
  const propertyQuery = useAdminProperty(inspection?.propertyId ?? "");

  if (query.isLoading)
    return (
      <AdminWorkspace>
        <DetailsSkeleton />
      </AdminWorkspace>
    );
  if (query.isError || !inspection)
    return (
      <AdminWorkspace>
        <main className="mx-auto max-w-7xl p-8">
          <Card>
            <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <CalendarDays className="size-12 text-muted-foreground" />
              <div>
                <h1 className="text-xl font-semibold">
                  Inspection details unavailable
                </h1>
                <p className="mt-2 text-muted-foreground">
                  The inquiry endpoint could not return this inspection.
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/inspections">Back to Inspections</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </AdminWorkspace>
    );

  return (
    <AdminWorkspace>
      <InspectionDetails
        inspection={inspection}
        property={propertyQuery.data}
      />
    </AdminWorkspace>
  );
}

function InspectionDetails({
  inspection,
  property,
}: {
  inspection: VendorInspection;
  property?: ReturnType<typeof useAdminProperty>["data"];
}) {
  const status = inspectionStatusLabel(inspection.status);
  const date = inspectionDateLabel(inspection.inspectionDate);
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<
    Array<{ body: string; createdAt: string }>
  >([]);

  function saveNote() {
    if (!note.trim()) return;
    const next = [
      ...savedNotes,
      { body: note.trim(), createdAt: new Date().toISOString() },
    ];
    setSavedNotes(next);
    setNote("");
    toast.success("Internal note saved");
  }

  function exportReport() {
    const text = [
      `Inspection: ${inspectionReference(inspection.id)}`,
      `Property: ${inspection.propertyName}`,
      `Buyer: ${inspection.userName}`,
      `Vendor: ${inspection.vendorName ?? "Not provided"}`,
      `Status: ${status}`,
      `Scheduled: ${date} ${inspectionTimeLabel(inspection)}`,
      `Message: ${inspection.message ?? "Not provided"}`,
      `Feedback: ${inspection.feedback ?? "Not provided"}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${inspectionReference(inspection.id)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <Button variant="link" className="h-auto px-0" asChild>
            <Link href="/admin/inspections">
              <ArrowLeft data-icon="inline-start" /> Back to Inspections
            </Link>
          </Button>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Inspection Details
            </h1>
            <InspectionBadge status={status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span># {inspectionReference(inspection.id)}</span>
            <span>{inspectionTypeLabel(inspection.meetingType)}</span>
            <span>
              Created: {inspectionDateLabel(inspection.requestSentAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download data-icon="inline-start" /> Export Report
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="More inspection actions"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => navigator.clipboard.writeText(inspection.id)}
                >
                  Copy inspection ID
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={exportReport}>
                  Download summary
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.95fr)]">
        <div className="flex flex-col gap-6">
          <ExecutionOverview inspection={inspection} />
          <PropertyCard inspection={inspection} property={property} />
          <div className="grid gap-4 md:grid-cols-2">
            <PersonCard
              label="Prospective Buyer"
              name={inspection.userName}
              subtitle={
                inspection.userId
                  ? `BUY-${inspection.userId.slice(-8).toUpperCase()}`
                  : (inspection.userEmail ?? "PropertyArk user")
              }
              avatar={inspection.userAvatarUrl}
              icon={UserRound}
              href={
                inspection.userId
                  ? `/admin/users/${inspection.userId}`
                  : undefined
              }
            />
            <PersonCard
              label="Listing Vendor"
              name={inspection.vendorName ?? "Vendor not provided"}
              subtitle={inspection.vendorEmail ?? "Agency account"}
              avatar={inspection.vendorAvatarUrl}
              icon={Building2}
              href={
                inspection.vendorId
                  ? `/admin/users/${inspection.vendorId}`
                  : undefined
              }
            />
          </div>
          <AuditTrail inspection={inspection} />
          <FeedbackCard inspection={inspection} />
          <Card>
            <CardHeader>
              <CardTitle>Internal Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {savedNotes.map((item, index) => (
                <div
                  key={`${item.createdAt}-${index}`}
                  className="rounded-lg bg-surface p-4 text-sm"
                >
                  <div className="flex justify-between gap-4 font-semibold">
                    <span>System Admin (You)</span>
                    <span className="text-xs text-muted-foreground">
                      {inspectionDateLabel(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
                </div>
              ))}
              <label className="flex flex-col gap-2 text-sm font-medium">
                Add New Note
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Enter private notes regarding this inspection..."
                  className="min-h-28"
                />
              </label>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={saveNote} disabled={!note.trim()}>
                Save Note
              </Button>
            </CardFooter>
          </Card>
        </div>
        <InspectionSummary
          inspection={inspection}
          status={status}
          onExport={exportReport}
        />
      </div>
    </main>
  );
}

function ExecutionOverview({ inspection }: { inspection: VendorInspection }) {
  const items = [
    {
      label: "Scheduled Date",
      value: inspectionDateLabel(inspection.inspectionDate),
    },
    { label: "Time Window", value: inspectionTimeLabel(inspection) },
    {
      label: "Duration",
      value:
        inspection.status === "COMPLETED"
          ? "Completed visit"
          : "Pending completion",
    },
    {
      label: "Satisfaction",
      value: inspection.satisfactionScore
        ? `★ ${inspection.satisfactionScore.toFixed(1)} / 5`
        : "Not rated",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 font-medium">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PropertyCard({
  inspection,
  property,
}: {
  inspection: VendorInspection;
  property?: ReturnType<typeof useAdminProperty>["data"];
}) {
  const image =
    property?.media?.find((item) => item.type === "IMAGE")?.url ??
    inspection.propertyImageUrl;
  return (
    <Card>
      <CardContent className="grid gap-5 p-5 sm:grid-cols-[190px_1fr]">
        {" "}
        <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="190px"
            />
          ) : (
            <Building2 className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {inspection.propertyName}
              </h2>
              {property?.listingStatus && (
                <Badge variant="secondary">{property.listingStatus}</Badge>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {inspection.location}
            </p>
          </div>
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Listing ID</p>
              <p className="font-medium">
                {inspection.propertyReference ??
                  inspection.propertyId ??
                  "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Listed Price</p>
              <p className="font-medium">
                {property ? adminPropertyPrice(property) : "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonCard({
  label,
  name,
  subtitle,
  avatar,
  icon: Icon,
  href,
}: {
  label: string;
  name: string;
  subtitle: string;
  avatar: string | null;
  icon: typeof UserRound;
  href?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="size-12">
          <AvatarImage src={avatar ?? undefined} alt="" />
          <AvatarFallback>{initials(name) || <Icon />}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {href && (
          <Button size="icon" variant="ghost" asChild>
            <Link href={href} aria-label={`View ${name}`}>
              <ExternalLink />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AuditTrail({ inspection }: { inspection: VendorInspection }) {
  const events = useMemo(() => {
    const rows = [
      {
        title: "Inspection Requested",
        actor: `Actor: ${inspection.userName} (Buyer)`,
        date: inspection.requestSentAt,
        note: inspection.message,
      },
    ];
    if (
      ["ACCEPTED", "CONFIRMED", "SCHEDULED", "COMPLETED"].includes(
        inspection.status,
      )
    )
      rows.push({
        title: "Request Accepted",
        actor: `Actor: ${inspection.vendorName ?? "Listing vendor"}`,
        date: inspection.updatedAt ?? inspection.inspectionDate,
        note: "The vendor accepted the inspection request.",
      });
    if (inspection.inspectionDate)
      rows.push({
        title: "Scheduled",
        actor: `Scheduled for ${inspectionDateLabel(inspection.inspectionDate)}, ${inspectionTimeLabel(inspection)}`,
        date: inspection.inspectionDate,
        note: null,
      });
    if (inspection.status === "COMPLETED")
      rows.push({
        title: "Inspection Completed",
        actor: "The inspection was marked as completed.",
        date: inspection.updatedAt ?? inspection.inspectionDate,
        note: inspection.feedback,
      });
    return rows;
  }, [inspection]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5 text-primary" /> Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-7 border-l-2 border-primary/20 pl-6">
          {events.map((event) => (
            <div key={event.title} className="relative">
              <span className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-primary bg-background" />
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold">{event.title}</p>
                <span className="text-xs text-muted-foreground">
                  {inspectionDateLabel(event.date ?? "")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {event.actor}
              </p>
              {event.note && (
                <p className="mt-3 rounded-lg bg-primary/10 p-4 text-sm">
                  {event.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackCard({ inspection }: { inspection: VendorInspection }) {
  const rating = Math.max(
    0,
    Math.min(5, Math.round(inspection.satisfactionScore ?? 0)),
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post-Inspection Feedback</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="rounded-lg bg-primary/10 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">Overall Rating:</span>
            <span className="flex text-warning">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={cn("size-4", index < rating && "fill-current")}
                />
              ))}
            </span>
          </div>
          <p className="mt-3 text-sm italic text-muted-foreground">
            {inspection.feedback ??
              "No written feedback has been submitted for this inspection."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FeedbackItem
            label="Matched Listing Description"
            passed={!inspection.issueReported}
          />
          <FeedbackItem
            label="Representative Attended"
            passed={inspection.status === "COMPLETED"}
          />
          <FeedbackItem
            label="Property Accessibility"
            passed={!inspection.issueReported}
          />
          <FeedbackItem
            label="Issue Reported"
            passed={inspection.issueReported}
            negative
          />
        </div>
      </CardContent>
    </Card>
  );
}
function FeedbackItem({
  label,
  passed,
  negative = false,
}: {
  label: string;
  passed: boolean;
  negative?: boolean;
}) {
  const good = negative ? !passed : passed;
  return (
    <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
      <span>{label}</span>
      {good ? (
        <Check className="size-4 text-primary" />
      ) : (
        <X className="size-4 text-destructive" />
      )}
    </div>
  );
}

function InspectionSummary({
  inspection,
  status,
  onExport,
}: {
  inspection: VendorInspection;
  status: string;
  onExport: () => void;
}) {
  const rows = [
    { label: "Status", value: <InspectionBadge status={status} /> },
    {
      label: "Date Executed",
      value: inspectionDateLabel(inspection.inspectionDate),
    },
    { label: "Vendor", value: inspection.vendorName ?? "Not provided" },
    { label: "User", value: inspection.userName },
    {
      label: "User Confirmation",
      value: inspection.status === "COMPLETED" ? "Confirmed" : "Pending",
    },
    {
      label: "Satisfaction Score",
      value: inspection.satisfactionScore
        ? `${inspection.satisfactionScore.toFixed(1)} ★`
        : "Not rated",
    },
  ];
  return (
    <Card className="overflow-hidden py-0 xl:sticky xl:top-24">
      <CardHeader className="bg-primary/10 py-6">
        <CardTitle>Inspection Summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick overview of current state.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b py-4 text-sm last:border-0"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-right font-medium">{row.value}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button variant="outline" className="w-full" onClick={onExport}>
          View Full Document
        </Button>
      </CardFooter>
    </Card>
  );
}

function InspectionBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === "Issue Reported" ? "destructive" : "secondary"}
      className={cn(
        status === "Scheduled" && "bg-primary/10 text-primary",
        status === "Requested" && "bg-warning/15 text-warning",
        status === "Completed" && "bg-success/15 text-success",
      )}
    >
      <CheckCircle2 /> {status}
    </Badge>
  );
}

function DetailsSkeleton() {
  return (
    <main className="mx-auto flex max-w-[1500px] flex-col gap-6 p-8">
      <Skeleton className="h-12 w-80" />
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-44" />
          <Skeleton className="h-52" />
          <Skeleton className="h-[620px]" />
        </div>
        <Skeleton className="h-[520px]" />
      </div>
    </main>
  );
}
