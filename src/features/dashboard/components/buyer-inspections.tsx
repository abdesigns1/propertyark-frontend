"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BedDouble,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileClock,
  HeartOff,
  House,
  LoaderCircle,
  MapPin,
  MessageSquare,
  PlusCircle,
  Ruler,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAvailableProperties } from "@/features/properties/hooks/use-available-properties";
import type { Property } from "@/features/properties/types";
import { getApiErrorMessage } from "@/services/api-error";
import {
  inspectionService,
  type VendorInspection as BuyerInspection,
} from "@/services/inspection.service";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const BUYER_INSPECTIONS_KEY = ["buyer", "inspections"] as const;
const ACTIVE_STATUSES = ["ACCEPTED", "CONFIRMED", "SCHEDULED"];

function statusLabel(status: string) {
  if (ACTIVE_STATUSES.includes(status)) return "Confirmed";
  if (status === "PENDING") return "Pending";
  if (status === "COMPLETED") return "Completed";
  return "Cancelled";
}

function statusVariant(status: string) {
  if (ACTIVE_STATUSES.includes(status)) return "default" as const;
  if (status === "PENDING") return "secondary" as const;
  if (status === "COMPLETED") return "outline" as const;
  return "destructive" as const;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(inspection: BuyerInspection) {
  if (inspection.time) {
    const parsed = new Date(`2000-01-01T${inspection.time}`);
    if (!Number.isNaN(parsed.getTime()))
      return parsed.toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      });
  }
  const parsed = new Date(inspection.inspectionDate);
  return Number.isNaN(parsed.getTime())
    ? "Time unavailable"
    : parsed.toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      });
}

export function BuyerInspections() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = useAuthStore((state) => state.userId);
  const query = useQuery({
    queryKey: BUYER_INSPECTIONS_KEY,
    queryFn: inspectionService.getBuyerInspections,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const propertyQuery = useAvailableProperties(1, 100);
  const properties = propertyQuery.data?.properties ?? [];
  const inspections = useMemo(
    () => query.data?.inspections ?? [],
    [query.data?.inspections],
  );
  const [requestOpen, setRequestOpen] = useState(false);
  const [successProperty, setSuccessProperty] = useState("");
  const [selected, setSelected] = useState<BuyerInspection | null>(null);
  const [propertyId, setPropertyId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingType, setMeetingType] = useState("IN_PERSON");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedProperty = properties.find((item) => item.id === propertyId);
  const selectedDetailsProperty = properties.find(
    (item) => item.id === selected?.propertyId,
  );
  const upcoming = inspections.filter((item) =>
    ACTIVE_STATUSES.includes(item.status),
  );
  const counts = useMemo(
    () => ({
      upcoming: upcoming.length,
      pending: inspections.filter((item) => item.status === "PENDING").length,
      completed: inspections.filter((item) => item.status === "COMPLETED").length,
      cancelled: inspections.filter((item) =>
        ["DECLINED", "REJECTED", "CANCELLED"].includes(item.status),
      ).length,
    }),
    [inspections, upcoming.length],
  );

  const schedule = useMutation({
    mutationFn: () =>
      inspectionService.schedule({
        propertyId,
        buyerId: user?.id ?? userId,
        name: user?.fullName ?? "PropertyArk user",
        location:
          user?.location ??
          (selectedProperty
            ? `${selectedProperty.location.city}, ${selectedProperty.location.state}`
            : "Location not provided"),
        message:
          message.trim() ||
          `I would like to inspect ${selectedProperty?.title ?? "this property"}.`,
        meetingType: meetingType as "IN_PERSON" | "VIDEO_CALL",
        date,
        time,
      }),
    onSuccess: async () => {
      setSuccessProperty(selectedProperty?.title ?? "the property");
      setRequestOpen(false);
      setPropertyId("");
      setDate("");
      setTime("");
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: BUYER_INSPECTIONS_KEY });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The inspection request could not be sent.")),
  });

  const submitRequest = () => {
    setSubmitted(true);
    if (!propertyId || !date || !time) return;
    schedule.mutate();
  };

  if (query.isLoading) return <BuyerInspectionSkeleton />;

  if (query.isError) {
    return (
      <Empty className="min-h-[520px] rounded-xl border">
        <EmptyHeader>
          <EmptyTitle>Inspections could not be loaded</EmptyTitle>
          <EmptyDescription>
            {getApiErrorMessage(
              query.error,
              "Please check your connection and try again.",
            )}
          </EmptyDescription>
        </EmptyHeader>
        <Button onClick={() => query.refetch()}>Try again</Button>
      </Empty>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Property Inspections</h1>
          <p className="mt-1 text-muted-foreground">
            Schedule and manage your property visits with verified vendors.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setRequestOpen(true)}>
            <PlusCircle data-icon="inline-start" />
            Request Inspection
          </Button>
          <Button variant="outline" asChild>
            <Link href="/properties">Explore Properties</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inspection summary">
        <SummaryCard label="Upcoming" value={counts.upcoming} note="Active visits" icon={CalendarCheck2} />
        <SummaryCard label="Pending" value={counts.pending} note="Waiting approval" icon={FileClock} />
        <SummaryCard label="Completed" value={counts.completed} note="Past inspections" icon={CheckCircle2} />
        <SummaryCard label="Cancelled" value={counts.cancelled} note="Closed requests" icon={HeartOff} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Inspections</h2>
              <span className="text-sm text-primary">{upcoming.length} scheduled</span>
            </div>
            {upcoming.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.slice(0, 4).map((inspection) => (
                  <InspectionCard
                    key={inspection.id}
                    inspection={inspection}
                    property={properties.find((item) => item.id === inspection.propertyId)}
                    onDetails={() => setSelected(inspection)}
                  />
                ))}
              </div>
            ) : (
              <Empty className="min-h-64 rounded-xl border">
                <EmptyHeader>
                  <EmptyTitle>No upcoming inspections</EmptyTitle>
                  <EmptyDescription>
                    Confirmed property visits will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </section>

          <HistoryTable inspections={inspections} onDetails={setSelected} />
        </div>

        <aside className="flex flex-col gap-5">
          <InspectionCalendar inspections={inspections} />
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Vendor Verification</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                PropertyArk vendors are reviewed for identity and property ownership validity.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/properties">Explore Verified Properties</Link>
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>

      <RequestInspectionDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        properties={properties}
        propertyId={propertyId}
        setPropertyId={setPropertyId}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        meetingType={meetingType}
        setMeetingType={setMeetingType}
        message={message}
        setMessage={setMessage}
        submitted={submitted}
        submitting={schedule.isPending}
        onSubmit={submitRequest}
      />

      <SuccessDialog propertyName={successProperty} onClose={() => setSuccessProperty("")} />
      <InspectionDetailsSheet
        inspection={selected}
        property={selectedDetailsProperty}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function SummaryCard({ label, value, note, icon: Icon }: { label: string; value: number; note: string; icon: typeof House }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardDescription className="uppercase tracking-wide">{label}</CardDescription>
        <Icon className="size-5 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function InspectionCard({ inspection, property, onDetails }: { inspection: BuyerInspection; property?: Property; onDetails: () => void }) {
  const image = property?.images[0] ?? inspection.propertyImageUrl ?? "/assets/images/hero-property.jpeg";
  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative aspect-[16/8] bg-muted">
        <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
        <Badge className="absolute right-3 top-3" variant="secondary">
          {inspection.meetingType === "VIDEO_CALL" ? <Video /> : <MapPin />}
          {inspection.meetingType === "VIDEO_CALL" ? "Virtual" : "Physical"}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle>{inspection.propertyName}</CardTitle>
        <CardDescription>{inspection.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar><AvatarFallback>{inspection.propertyName.slice(0, 2)}</AvatarFallback></Avatar>
          <div><p className="text-sm font-medium">Property vendor</p><p className="text-xs text-muted-foreground">Verified listing</p></div>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2"><CalendarCheck2 className="size-4" />{formatDate(inspection.inspectionDate)}</span>
          <span className="flex items-center gap-2"><Clock3 className="size-4" />{formatTime(inspection)}</span>
        </div>
      </CardContent>
      <CardFooter><Button className="w-full" onClick={onDetails}>View Details</Button></CardFooter>
    </Card>
  );
}

function HistoryTable({ inspections, onDetails }: { inspections: BuyerInspection[]; onDetails: (item: BuyerInspection) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader><CardTitle>Request History</CardTitle></CardHeader>
      <CardContent className="p-0">
        {inspections.length ? (
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-6">Property</TableHead><TableHead>Date Requested</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
            {inspections.map((inspection) => <TableRow key={inspection.id}><TableCell className="pl-6"><p className="font-medium">{inspection.propertyName}</p><p className="text-xs text-muted-foreground">Ref: {inspection.id.slice(0, 10).toUpperCase()}</p></TableCell><TableCell>{formatDate(inspection.requestSentAt)}</TableCell><TableCell><Badge variant={statusVariant(inspection.status)}>{statusLabel(inspection.status)}</Badge></TableCell><TableCell><Button variant="link" onClick={() => onDetails(inspection)}>Details</Button></TableCell></TableRow>)}
          </TableBody></Table></div>
        ) : <Empty className="min-h-48"><EmptyHeader><EmptyTitle>No inspection history</EmptyTitle><EmptyDescription>Your requests will appear here after booking.</EmptyDescription></EmptyHeader></Empty>}
      </CardContent>
    </Card>
  );
}

function InspectionCalendar({ inspections }: { inspections: BuyerInspection[] }) {
  const [month, setMonth] = useState(() => new Date());
  const year = month.getFullYear(); const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const inspectionDays = new Map<number, string>();
  inspections.forEach((item) => { const date = new Date(item.inspectionDate); if (date.getFullYear() === year && date.getMonth() === monthIndex) inspectionDays.set(date.getDate(), item.status); });
  return <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Calendar</CardTitle><div className="flex items-center gap-1"><Button size="icon-sm" variant="ghost" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><ChevronLeft /><span className="sr-only">Previous month</span></Button><span className="min-w-28 text-center text-sm font-medium">{month.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</span><Button size="icon-sm" variant="ghost" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><ChevronRight /><span className="sr-only">Next month</span></Button></div></CardHeader><CardContent><div className="grid grid-cols-7 gap-y-2 text-center text-xs">{["S","M","T","W","T","F","S"].map((day,index) => <span key={`${day}-${index}`} className="font-semibold text-muted-foreground">{day}</span>)}{Array.from({ length: firstDay }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => { const day=index+1; const status=inspectionDays.get(day); return <span key={day} className={cn("relative flex aspect-square items-center justify-center rounded-md", status && "bg-primary/10 font-semibold text-primary")}>{day}{status && <span className={cn("absolute bottom-1 size-1 rounded-full", status === "PENDING" ? "bg-secondary" : "bg-primary")} />}</span>; })}</div><div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />Confirmed</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-secondary" />Pending</span></div></CardContent></Card>;
}

interface RequestDialogProps { open: boolean; onOpenChange: (open:boolean)=>void; properties: Property[]; propertyId:string; setPropertyId:(value:string)=>void; date:string; setDate:(value:string)=>void; time:string; setTime:(value:string)=>void; meetingType:string; setMeetingType:(value:string)=>void; message:string; setMessage:(value:string)=>void; submitted:boolean; submitting:boolean; onSubmit:()=>void; }
function RequestInspectionDialog(props: RequestDialogProps) {
  return <Dialog open={props.open} onOpenChange={props.onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Request Property Inspection</DialogTitle><DialogDescription>Fill in the details to schedule a new inspection.</DialogDescription></DialogHeader><FieldGroup><Field data-invalid={props.submitted && !props.propertyId}><FieldLabel>Property</FieldLabel><Select value={props.propertyId} onValueChange={props.setPropertyId}><SelectTrigger className="w-full" aria-invalid={props.submitted && !props.propertyId}><SelectValue placeholder="Choose a property..." /></SelectTrigger><SelectContent><SelectGroup>{props.properties.map((property) => <SelectItem key={property.id} value={property.id}>{property.title}</SelectItem>)}</SelectGroup></SelectContent></Select>{props.submitted && !props.propertyId && <FieldError>Select a property.</FieldError>}</Field><div className="grid gap-4 sm:grid-cols-2"><Field data-invalid={props.submitted && !props.date}><FieldLabel>Date</FieldLabel><Input type="date" min={new Date().toISOString().slice(0,10)} value={props.date} onChange={(event)=>props.setDate(event.target.value)} aria-invalid={props.submitted && !props.date} />{props.submitted && !props.date && <FieldError>Select a date.</FieldError>}</Field><Field data-invalid={props.submitted && !props.time}><FieldLabel>Time</FieldLabel><Input type="time" value={props.time} onChange={(event)=>props.setTime(event.target.value)} aria-invalid={props.submitted && !props.time} />{props.submitted && !props.time && <FieldError>Select a time.</FieldError>}</Field></div><Field><FieldLabel>Inspection Type</FieldLabel><ToggleGroup type="single" value={props.meetingType} onValueChange={(value)=>value && props.setMeetingType(value)}><ToggleGroupItem value="VIDEO_CALL"><Video />Virtual</ToggleGroupItem><ToggleGroupItem value="IN_PERSON"><MapPin />Physical</ToggleGroupItem></ToggleGroup></Field><Field><FieldLabel>Additional Instructions</FieldLabel><Textarea rows={4} value={props.message} onChange={(event)=>props.setMessage(event.target.value)} placeholder="Enter any specific details or access instructions..." /></Field></FieldGroup><DialogFooter><Button variant="outline" onClick={()=>props.onOpenChange(false)}>Cancel</Button><Button disabled={props.submitting} onClick={props.onSubmit}>{props.submitting && <LoaderCircle data-icon="inline-start" className="animate-spin" />}Submit Request</Button></DialogFooter></DialogContent></Dialog>;
}

function SuccessDialog({ propertyName, onClose }: { propertyName:string; onClose:()=>void }) { return <Dialog open={Boolean(propertyName)} onOpenChange={(open)=>!open && onClose()}><DialogContent className="sm:max-w-xl"><div className="flex min-h-96 flex-col items-center justify-center gap-6 text-center"><span className="flex size-28 items-center justify-center rounded-full border-8 border-success text-success"><Check className="size-14" /></span><div><DialogTitle className="text-3xl">Inspection Booked Successfully</DialogTitle><DialogDescription className="mx-auto mt-3 max-w-md text-base">Your inspection request for <strong>{propertyName}</strong> was sent. You will be notified when the vendor responds.</DialogDescription></div><Button onClick={onClose}>Close</Button></div></DialogContent></Dialog>; }

function InspectionDetailsSheet({ inspection, property, onOpenChange }: { inspection: BuyerInspection | null; property?: Property; onOpenChange:(open:boolean)=>void }) {
  if (!inspection) return null;
  const image=property?.images[0] ?? inspection.propertyImageUrl ?? "/assets/images/hero-property.jpeg";
  return <Sheet open onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto p-0 sm:max-w-[520px]"><SheetHeader className="border-b p-6"><SheetTitle>Inspection Details</SheetTitle><SheetDescription>ID: #{inspection.id.slice(0,14).toUpperCase()}</SheetDescription></SheetHeader><div className="flex flex-col gap-6 p-6"><div className="relative aspect-video overflow-hidden rounded-xl bg-muted"><Image src={image} alt="" fill sizes="520px" className="object-cover" /></div><div><h2 className="text-xl font-semibold">{inspection.propertyName}</h2><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{inspection.location}</p></div>{property && <div className="grid grid-cols-3 rounded-xl border p-4 text-center text-xs"><span><BedDouble className="mx-auto mb-1 size-5" />{property.bedrooms} beds</span><span className="border-x"><House className="mx-auto mb-1 size-5" />{property.bathrooms} baths</span><span><Ruler className="mx-auto mb-1 size-5" />{property.sizeSqm} {property.sizeUnit}</span></div>}<Separator /><div><div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inspection Details</p><Badge variant={statusVariant(inspection.status)}>{statusLabel(inspection.status)}</Badge></div><div className="grid gap-4 sm:grid-cols-2"><p><span className="block text-xs text-muted-foreground">Date</span>{formatDate(inspection.inspectionDate)}</p><p><span className="block text-xs text-muted-foreground">Time</span>{formatTime(inspection)}</p><p><span className="block text-xs text-muted-foreground">Type</span>{inspection.meetingType === "VIDEO_CALL" ? "Virtual inspection" : "Physical visit"}</p><p><span className="block text-xs text-muted-foreground">Location</span>{inspection.location}</p></div></div>{inspection.location && <Button variant="secondary" asChild><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inspection.location)}`} target="_blank" rel="noreferrer"><ExternalLink data-icon="inline-start" />Open in Google Maps</a></Button>}<Separator /><div><p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</p><div className="flex flex-col gap-5"><TimelineItem label="Request Sent" date={inspection.requestSentAt} /><TimelineItem label={inspection.status === "PENDING" ? "Waiting for vendor" : "Vendor Acknowledged"} date={inspection.updatedAt} /></div></div>{inspection.message && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="size-4" />Your note</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{inspection.message}</CardContent></Card>}</div></SheetContent></Sheet>;
}

function TimelineItem({ label, date }: { label:string; date:string | null }) { return <div className="flex gap-3"><span className="mt-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span><div><p className="font-medium">{label}</p><p className="text-xs uppercase text-muted-foreground">{date ? `${formatDate(date)} · ${new Date(date).toLocaleTimeString("en-NG", { hour:"numeric", minute:"2-digit" })}` : "Pending"}</p></div></div>; }

function BuyerInspectionSkeleton() { return <div className="flex flex-col gap-6"><Skeleton className="h-20" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,index)=><Skeleton key={index} className="h-32" />)}</div><Skeleton className="h-[620px]" /></div>; }
