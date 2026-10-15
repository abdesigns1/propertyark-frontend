"use client";

import { useMemo, useState } from "react";
import {
  Download,
  MailCheck,
  MailX,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
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
import { NewsletterSubscriberDeleteDialog } from "@/features/admin/components/newsletter-subscriber-delete-dialog";
import { useNewsletterSubscribers } from "@/features/newsletter/hooks/use-newsletter";
import { exportNewsletterSubscribers } from "@/features/newsletter/lib/export-newsletter-subscribers";
import {
  formatNewsletterDate,
  newsletterDateValue,
} from "@/features/newsletter/lib/newsletter";
import type { NewsletterSubscriber } from "@/services/newsletter.service";

const PAGE_SIZE = 10;

export function AdminNewsletterSubscribersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subscriberToDelete, setSubscriberToDelete] =
    useState<NewsletterSubscriber | null>(null);
  const query = useNewsletterSubscribers();
  const subscribers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return [...(query.data ?? [])]
      .filter((subscriber) =>
        term
          ? [subscriber.name, subscriber.email]
              .join(" ")
              .toLocaleLowerCase()
              .includes(term)
          : true,
      )
      .sort(
        (first, second) =>
          newsletterDateValue(second.subscribedAt) -
          newsletterDateValue(first.subscribedAt),
      );
  }, [query.data, search]);
  const totalPages = Math.max(1, Math.ceil(subscribers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleSubscribers = subscribers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage people subscribed to PropertyArk updates.
          </p>
        </header>

        <SubscriberStats
          subscribers={query.data ?? []}
          loading={query.isLoading}
        />

        <Card className="mt-9 overflow-hidden py-0">
          <CardHeader className="gap-4 border-b bg-surface/50 py-5 lg:grid-cols-[minmax(220px,1fr)_minmax(380px,640px)] lg:items-end">
            <div>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription className="mt-1">
                {subscribers.length.toLocaleString("en-NG")} matching records
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <InputGroup className="flex-1">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  placeholder="Search subscriber name or email"
                  aria-label="Search newsletter subscribers"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>
              <Button
                type="button"
                variant="outline"
                disabled={query.isLoading || subscribers.length === 0}
                onClick={() => exportNewsletterSubscribers(subscribers)}
              >
                <Download data-icon="inline-start" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {query.isLoading ? (
              <SubscriberTableSkeleton />
            ) : query.isError ? (
              <Empty className="min-h-80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MailCheck />
                  </EmptyMedia>
                  <EmptyTitle>Subscribers could not be loaded</EmptyTitle>
                  <EmptyDescription>
                    Check the API connection and try loading the subscribers
                    again.
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
            ) : visibleSubscribers.length ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Unsubscribed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>
                          <p className="font-medium">
                            {subscriber.name || "Unnamed subscriber"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subscriber.email || "No email provided"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              subscriber.isActive ? "secondary" : "outline"
                            }
                          >
                            {subscriber.isActive ? "Active" : "Unsubscribed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatNewsletterDate(subscriber.subscribedAt)}
                        </TableCell>
                        <TableCell>
                          {subscriber.unsubscribedAt
                            ? formatNewsletterDate(subscriber.unsubscribedAt)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${subscriber.email || "subscriber"}`}
                            onClick={() => setSubscriberToDelete(subscriber)}
                          >
                            <Trash2 />
                          </Button>
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
                    <UsersRound />
                  </EmptyMedia>
                  <EmptyTitle>No newsletter subscribers</EmptyTitle>
                  <EmptyDescription>
                    New subscriptions from the website footer will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          {!query.isLoading && !query.isError && subscribers.length > 0 && (
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

      <NewsletterSubscriberDeleteDialog
        subscriber={subscriberToDelete}
        open={Boolean(subscriberToDelete)}
        onOpenChange={(open) => {
          if (!open) setSubscriberToDelete(null);
        }}
      />
    </AdminWorkspace>
  );
}

function SubscriberStats({
  subscribers,
  loading,
}: {
  subscribers: NewsletterSubscriber[];
  loading: boolean;
}) {
  const activeCount = subscribers.filter(
    (subscriber) => subscriber.isActive,
  ).length;
  const inactiveCount = subscribers.length - activeCount;

  return (
    <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AdminStatCard
        label="Total Subscribers"
        value={subscribers.length}
        note="All newsletter records"
        icon={UsersRound}
        loading={loading}
      />
      <AdminStatCard
        label="Active Subscribers"
        value={activeCount}
        note="Currently receiving updates"
        icon={MailCheck}
        loading={loading}
        tone="success"
      />
      <AdminStatCard
        label="Unsubscribed"
        value={inactiveCount}
        note="No longer receiving updates"
        icon={MailX}
        loading={loading}
        tone="muted"
      />
    </section>
  );
}

function SubscriberTableSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
