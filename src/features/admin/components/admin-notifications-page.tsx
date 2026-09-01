"use client";

import { useMemo, useState } from "react";
import { CheckCheck, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { AdminNotificationItem } from "@/features/admin/components/admin-notification-item";
import { AdminNotificationSidebar } from "@/features/admin/components/admin-notification-sidebar";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import {
  useAdminNotifications,
  useAdminNotificationStats,
  useMarkAdminNotificationRead,
  useMarkAllAdminNotificationsRead,
} from "@/features/admin/hooks/use-admin-notifications";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/services/api-error";
import type { AdminNotification } from "@/services/notification.service";

const notificationTabs = [
  { value: "ALL", label: "All Notifications" },
  { value: "UNREAD", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export function AdminNotificationsPage() {
  const [category, setCategory] = useState("ALL");
  const notificationsQuery = useAdminNotifications();
  const statsQuery = useAdminNotificationStats();
  const markRead = useMarkAdminNotificationRead();
  const markAllRead = useMarkAllAdminNotificationsRead();
  const notifications = useMemo(
    () => notificationsQuery.data?.notifications ?? [],
    [notificationsQuery.data?.notifications],
  );
  const visibleNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        if (category === "UNREAD") return !item.isRead;
        if (category === "READ") return item.isRead;
        if (category === "CRITICAL") {
          return ["URGENT", "CRITICAL"].includes(item.priority);
        }
        return true;
      }),
    [category, notifications],
  );
  const groups = useMemo(
    () => groupNotifications(visibleNotifications),
    [visibleNotifications],
  );
  const derivedUnread = notifications.filter((item) => !item.isRead).length;
  const derivedCritical = notifications.filter((item) =>
    ["URGENT", "CRITICAL"].includes(item.priority),
  ).length;
  const unread = Math.max(statsQuery.data?.unread ?? 0, derivedUnread);
  const total = Math.max(
    notificationsQuery.data?.pagination.total ?? 0,
    notifications.length,
    unread,
  );

  function markNotificationRead(id: string) {
    markRead.mutate(id, {
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "The notification could not be updated."),
        ),
    });
  }

  function markAllAsRead() {
    markAllRead.mutate(undefined, {
      onSuccess: () => toast.success("All notifications marked as read."),
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "Notifications could not be updated."),
        ),
    });
  }

  return (
    <AdminWorkspace>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,2.1fr)_380px]">
          <section className="min-w-0">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Notifications
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Manage alerts across the platform
                </p>
              </div>
              <Button
                variant="outline"
                disabled={markAllRead.isPending || derivedUnread === 0}
                onClick={markAllAsRead}
              >
                <CheckCheck data-icon="inline-start" />
                Mark all as read
              </Button>
            </header>

            <Tabs value={category} onValueChange={setCategory} className="mt-9">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-muted/60 p-1.5">
                {notificationTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-none px-4 py-2 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="mt-7">
              {notificationsQuery.isLoading ? (
                <NotificationSkeleton />
              ) : notificationsQuery.isError ? (
                <Empty className="min-h-80 border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ListFilter />
                    </EmptyMedia>
                    <EmptyTitle>Notifications could not be loaded</EmptyTitle>
                    <EmptyDescription>
                      Please refresh the page or try again shortly.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : groups.length ? (
                <div className="flex flex-col gap-7">
                  {groups.map((group) => (
                    <section key={group.label}>
                      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {group.label}
                      </h2>
                      <div className="flex flex-col gap-3">
                        {group.items.map((notification) => (
                          <AdminNotificationItem
                            key={notification.id}
                            notification={notification}
                            pending={markRead.isPending}
                            onMarkRead={markNotificationRead}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <Empty className="min-h-80 border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckCheck />
                    </EmptyMedia>
                    <EmptyTitle>No notifications here</EmptyTitle>
                    <EmptyDescription>
                      There are no alerts in this category.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </section>

          <AdminNotificationSidebar
            total={total}
            unread={unread}
            critical={Math.max(statsQuery.data?.critical ?? 0, derivedCritical)}
            read={Math.max(0, total - unread)}
          />
        </div>
      </main>
    </AdminWorkspace>
  );
}

function groupNotifications(notifications: AdminNotification[]) {
  const groups = new Map<string, AdminNotification[]>();

  notifications.forEach((notification) => {
    const label = dateGroup(notification.createdAt);
    groups.set(label, [...(groups.get(label) ?? []), notification]);
  });

  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

function dateGroup(value: string) {
  const date = new Date(value);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const difference = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-20" />
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  );
}
