"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MessageSquareText,
  Reply,
  Trash2,
  UserRound,
} from "lucide-react";
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
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { ContactMessageDeleteDialog } from "@/features/admin/components/contact-message-delete-dialog";
import { useAdminContactMessage } from "@/features/messages/hooks/use-contact-messages";
import { formatContactMessageDate } from "@/features/messages/lib/contact-message";

export function AdminContactMessageDetailsPage({
  contactId,
}: {
  contactId: string;
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const query = useAdminContactMessage(contactId);
  const contact = query.data;

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/contacts">
            <ArrowLeft data-icon="inline-start" />
            Back to contact messages
          </Link>
        </Button>

        {query.isLoading ? (
          <ContactDetailsSkeleton />
        ) : query.isError || !contact ? (
          <Empty className="mt-8 min-h-96 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Mail />
              </EmptyMedia>
              <EmptyTitle>Contact message could not be loaded</EmptyTitle>
              <EmptyDescription>
                The message may have been removed or is temporarily unavailable.
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
                <p className="text-sm font-medium text-primary">
                  Contact enquiry
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {contact.subject || "No subject"}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Received{" "}
                  {formatContactMessageDate(contact.createdAt, {
                    includeTime: true,
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.email && (
                  <Button asChild>
                    <a
                      href={`mailto:${contact.email}?subject=${encodeURIComponent(`Re: ${contact.subject || "Your PropertyArk enquiry"}`)}`}
                    >
                      <Reply data-icon="inline-start" />
                      Reply by email
                    </a>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete message
                </Button>
              </div>
            </header>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
              <Card>
                <CardHeader>
                  <CardTitle>Message</CardTitle>
                  <CardDescription>
                    The complete message submitted through the Contact Us form.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-7">
                    {contact.message || "No message was supplied."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sender details</CardTitle>
                  <CardDescription>
                    Contact information supplied with this enquiry.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ContactDetailItem
                    icon={UserRound}
                    label="Name"
                    value={contact.fullName || "Not provided"}
                  />
                  <Separator />
                  <ContactDetailItem
                    icon={Mail}
                    label="Email"
                    value={contact.email || "Not provided"}
                    href={contact.email ? `mailto:${contact.email}` : undefined}
                  />
                  <Separator />
                  <ContactDetailItem
                    icon={MessageSquareText}
                    label="Subject"
                    value={contact.subject || "Not provided"}
                  />
                  <Separator />
                  <ContactDetailItem
                    icon={CalendarDays}
                    label="Received"
                    value={formatContactMessageDate(contact.createdAt, {
                      includeTime: true,
                    })}
                  />
                </CardContent>
              </Card>
            </div>

            <ContactMessageDeleteDialog
              contact={contact}
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onDeleted={() => router.replace("/admin/contacts")}
            />
          </>
        )}
      </main>
    </AdminWorkspace>
  );
}

function ContactDetailItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
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

function ContactDetailsSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-5">
      <Skeleton className="h-20 w-full max-w-2xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
