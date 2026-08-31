"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CalendarCheck2,
  Check,
  CheckCheck,
  CircleAlert,
  FileText,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedDialogIcon } from "@/components/animated-dialog-icon";
import { PaginationControls } from "@/components/shared/pagination-controls";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardNotificationIndicators } from "@/features/dashboard/hooks/use-vendor-notification-indicators";
import {
  useMarkAllVendorNotificationsRead,
  useMarkVendorNotificationRead,
  useVendorNotifications,
} from "@/features/vendor/hooks/use-vendor-notifications";
import { getApiErrorMessage } from "@/services/api-error";
import type { AdminNotification } from "@/services/notification.service";
import { cn } from "@/lib/utils";

type NotificationFilter = "ALL" | "UNREAD" | "READ";
type NotificationDateFilter = "ALL" | "TODAY" | "7_DAYS" | "30_DAYS";
type NotificationSort = "NEWEST" | "OLDEST";

const PAGE_SIZE = 20;

type NotificationAudience = "vendor" | "buyer";

export function VendorNotifications() {
  return <DashboardNotifications audience="vendor" />;
}

export function BuyerNotifications() {
  return <DashboardNotifications audience="buyer" />;
}

function DashboardNotifications({
  audience,
}: {
  audience: NotificationAudience;
}) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<NotificationDateFilter>("ALL");
  const [sort, setSort] = useState<NotificationSort>("NEWEST");
  const [selected, setSelected] = useState<AdminNotification | null>(null);
  const query = useVendorNotifications();
  const markRead = useMarkVendorNotificationRead();
  const markAllRead = useMarkAllVendorNotificationsRead();
  const { hasUnread, unreadCount } = useDashboardNotificationIndicators();
  const notifications = useMemo(
    () => query.data?.notifications ?? [],
    [query.data?.notifications],
  );
  const filteredNotifications = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const filtered = notifications
      .filter((notification) => {
        if (filter === "UNREAD") return !notification.isRead;
        if (filter === "READ") return notification.isRead;
        return true;
      })
      .filter((notification) => {
        if (dateFilter === "ALL") return true;
        const createdAt = new Date(notification.createdAt).getTime();
        if (!Number.isFinite(createdAt)) return false;
        if (dateFilter === "TODAY") return createdAt >= startOfToday;
        const days = dateFilter === "7_DAYS" ? 7 : 30;
        return createdAt >= now.getTime() - days * 24 * 60 * 60 * 1000;
      });

    return filtered.sort((left, right) => {
      const difference =
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime();
      return sort === "NEWEST" ? difference : -difference;
    });
  }, [dateFilter, filter, notifications, sort]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE),
  );
  const visibleNotifications = filteredNotifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function markOneAsRead(notification: AdminNotification) {
    if (notification.isRead) return;
    markRead.mutate(notification.id, {
      onError: (error) =>
        toast.error(
          getApiErrorMessage(error, "The notification could not be updated."),
        ),
    });
  }

  function openNotification(notification: AdminNotification) {
    setSelected(notification);
    markOneAsRead(notification);
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
    <main className="mx-auto max-w-6xl">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">
            {audience === "vendor" ? "Vendor" : "User"} notifications
          </Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated on bookings, inspections, property activity, and
            account updates.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={markAllAsRead}
        >
          <CheckCheck data-icon="inline-start" />
          Mark all as read
        </Button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Total notifications</CardDescription>
            <CardTitle className="text-3xl">
              {notifications.length.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unread notifications</CardDescription>
            <CardTitle className="text-3xl">
              {unreadCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as NotificationFilter);
          setPage(1);
        }}
        className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <TabsList className="h-10 p-1">
          <TabsTrigger
            className="px-4 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
            value="ALL"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            className="px-4 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
            value="UNREAD"
          >
            Unread
          </TabsTrigger>
          <TabsTrigger
            className="px-4 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
            value="READ"
          >
            Read
          </TabsTrigger>
        </TabsList>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value as NotificationDateFilter);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-48"
              aria-label="Filter notifications by date"
            >
              <CalendarDays className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Any date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Any date</SelectItem>
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="7_DAYS">Last 7 days</SelectItem>
                <SelectItem value="30_DAYS">Last 30 days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as NotificationSort);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label="Sort notifications by time"
            >
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="NEWEST">Newest first</SelectItem>
                <SelectItem value="OLDEST">Oldest first</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </Tabs>

      <section className="mt-5">
        {query.isLoading ? (
          <NotificationSkeleton />
        ) : query.isError ? (
          <Empty className="min-h-80 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlert />
              </EmptyMedia>
              <EmptyTitle>Notifications could not be loaded</EmptyTitle>
              <EmptyDescription>
                Please refresh the page or try again shortly.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : visibleNotifications.length ? (
          <div className="flex flex-col gap-3">
            {visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                pending={markRead.isPending}
                onOpen={() => openNotification(notification)}
                onMarkRead={() => markOneAsRead(notification)}
              />
            ))}
          </div>
        ) : (
          <Empty className="min-h-80 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>No notifications here</EmptyTitle>
              <EmptyDescription>
                There are no notifications in this category.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      {totalPages > 1 && (
        <div className="mt-8 rounded-xl border bg-surface/40 p-3">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <NotificationDialog
        audience={audience}
        notification={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </main>
  );
}

function NotificationCard({
  notification,
  pending,
  onOpen,
  onMarkRead,
}: {
  notification: AdminNotification;
  pending: boolean;
  onOpen: () => void;
  onMarkRead: () => void;
}) {
  const appearance = notificationAppearance(notification);
  const Icon = appearance.icon;

  return (
    <Card
      className={cn(
        "py-0 transition-colors",
        !notification.isRead && "border-primary/25 bg-primary/5",
      )}
    >
      <CardHeader className="flex-row items-start gap-4 px-4 pt-4 sm:px-5">
        <div className={cn("rounded-full p-3", appearance.iconClass)}>
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{notification.title}</CardTitle>
            {!notification.isRead && <Badge>New</Badge>}
          </div>
          <CardDescription className="mt-1 line-clamp-2 leading-6">
            {notification.message || "Open this notification for details."}
          </CardDescription>
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeDate(notification.createdAt)}
        </time>
      </CardHeader>
      <CardFooter className="justify-between border-t px-4 py-3 sm:px-5">
        <Badge variant="outline">{appearance.label}</Badge>
        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={onMarkRead}
            >
              <Check data-icon="inline-start" />
              Mark as read
            </Button>
          )}
          <Button size="sm" onClick={onOpen}>
            Open
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function NotificationDialog({
  notification,
  audience,
  open,
  onOpenChange,
}: {
  notification: AdminNotification | null;
  audience: NotificationAudience;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!notification) return null;
  const appearance = notificationAppearance(notification);
  const action = notificationAction(notification, audience);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="items-center pt-4 text-center">
          <AnimatedDialogIcon icon={appearance.icon} tone="primary" />
          <Badge variant="secondary">{appearance.label}</Badge>
          <DialogTitle className="text-2xl leading-tight">
            {notification.title}
          </DialogTitle>
          <DialogDescription>
            {formatFullDate(notification.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <Card className="my-2 bg-surface/50">
          <CardContent className="leading-7 text-muted-foreground">
            {notification.message || "No additional details were provided."}
          </CardContent>
        </Card>
        <DialogFooter showCloseButton>
          {action && (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function notificationAppearance(notification: AdminNotification) {
  const content = `${notification.type} ${notification.title}`;
  if (/booking|short[ -]?let/i.test(content)) {
    return {
      icon: CalendarCheck2,
      label: "Booking",
      iconClass: "bg-primary/10 text-primary",
    };
  }
  if (/inspection|inquiry|viewing/i.test(content)) {
    return {
      icon: FileText,
      label: "Inspection",
      iconClass: "bg-warning/10 text-warning",
    };
  }
  return {
    icon: Bell,
    label: notification.type === "GENERAL" ? "General" : notification.type,
    iconClass: "bg-muted text-muted-foreground",
  };
}

function notificationAction(
  notification: AdminNotification,
  audience: NotificationAudience,
) {
  const actionUrl = notification.actionUrl;
  if (actionUrl?.startsWith(`/${audience}/`)) {
    return {
      href: actionUrl,
      label: notification.actionLabel ?? "View update",
    };
  }
  const content = `${notification.type} ${notification.title}`;
  if (/booking|short[ -]?let/i.test(content)) {
    return audience === "vendor"
      ? { href: "/vendor/shortlet-bookings", label: "View booking" }
      : { href: "/buyer/dashboard", label: "View dashboard" };
  }
  if (/inspection|inquiry|viewing/i.test(content)) {
    return {
      href: `/${audience}/inspections`,
      label: "View inspection",
    };
  }
  return null;
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const difference = Date.now() - date.getTime();
  if (difference < 60_000) return "Just now";
  if (difference < 3_600_000) return `${Math.floor(difference / 60_000)}m ago`;
  if (difference < 86_400_000)
    return `${Math.floor(difference / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatFullDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently received";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
