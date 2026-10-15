"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Mail,
  MessageSquareText,
  Search,
  Trash2,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { ContactMessageDeleteDialog } from "@/features/admin/components/contact-message-delete-dialog";
import { useAdminContactMessages } from "@/features/messages/hooks/use-contact-messages";
import {
  contactDateValue,
  formatContactMessageDate,
  isContactFromLastDays,
  isContactFromToday,
} from "@/features/messages/lib/contact-message";
import type { ContactMessage } from "@/services/contact.service";

const PAGE_SIZE = 10;

export function AdminContactMessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [contactToDelete, setContactToDelete] = useState<ContactMessage | null>(
    null,
  );
  const query = useAdminContactMessages();
  const contacts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return [...(query.data ?? [])]
      .filter((contact) => {
        if (!term) return true;
        return [
          contact.fullName,
          contact.email,
          contact.subject,
          contact.message,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(term);
      })
      .sort(
        (first, second) =>
          contactDateValue(second.createdAt) -
          contactDateValue(first.createdAt),
      );
  }, [query.data, search]);
  const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleContacts = contacts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Contact Messages
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review enquiries submitted from the public Contact Us form.
          </p>
        </header>

        <ContactStats contacts={query.data ?? []} loading={query.isLoading} />

        <Card className="mt-9 overflow-hidden py-0">
          <CardHeader className="gap-4 border-b bg-surface/50 py-5 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,520px)] lg:items-end">
            <div>
              <CardTitle>Contact enquiries</CardTitle>
              <CardDescription className="mt-1">
                {contacts.length.toLocaleString("en-NG")} matching records
              </CardDescription>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                placeholder="Search name, email, subject or message"
                aria-label="Search contact messages"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>
          </CardHeader>
          <CardContent className="p-0">
            {query.isLoading ? (
              <ContactTableSkeleton />
            ) : query.isError ? (
              <Empty className="min-h-80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Mail />
                  </EmptyMedia>
                  <EmptyTitle>Contact messages could not be loaded</EmptyTitle>
                  <EmptyDescription>
                    Check the API connection and try loading the messages again.
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
            ) : visibleContacts.length ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[960px]">
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <p className="font-medium">
                            {contact.fullName || "Unknown sender"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.email || "No email provided"}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-64 font-medium">
                          <p className="truncate">
                            {contact.subject || "No subject"}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-80">
                          <p className="truncate text-muted-foreground">
                            {contact.message || "No message supplied"}
                          </p>
                        </TableCell>
                        <TableCell>
                          {formatContactMessageDate(contact.createdAt, {
                            includeTime: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/contacts/${contact.id}`}>
                                <Eye data-icon="inline-start" />
                                View
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete message from ${contact.fullName || contact.email || "sender"}`}
                              onClick={() => setContactToDelete(contact)}
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
                    <MessageSquareText />
                  </EmptyMedia>
                  <EmptyTitle>No contact messages</EmptyTitle>
                  <EmptyDescription>
                    New enquiries from the Contact Us page will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          {!query.isLoading && !query.isError && contacts.length > 0 && (
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

      <ContactMessageDeleteDialog
        contact={contactToDelete}
        open={Boolean(contactToDelete)}
        onOpenChange={(open) => {
          if (!open) setContactToDelete(null);
        }}
      />
    </AdminWorkspace>
  );
}

function ContactStats({
  contacts,
  loading,
}: {
  contacts: ContactMessage[];
  loading: boolean;
}) {
  const cards = [
    {
      label: "Total Messages",
      value: contacts.length,
      note: "All contact enquiries",
      icon: Mail,
    },
    {
      label: "Received Today",
      value: contacts.filter((contact) => isContactFromToday(contact.createdAt))
        .length,
      note: "Messages received today",
      icon: MessageSquareText,
    },
    {
      label: "Last 7 Days",
      value: contacts.filter((contact) =>
        isContactFromLastDays(contact.createdAt, 7),
      ).length,
      note: "Recent contact activity",
      icon: CalendarDays,
    },
  ];

  return (
    <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <AdminStatCard
          key={card.label}
          label={card.label}
          value={card.value}
          note={card.note}
          icon={card.icon}
          loading={loading}
        />
      ))}
    </section>
  );
}

function ContactTableSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
