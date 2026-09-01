import Link from "next/link";
import {
  Banknote,
  CircleUserRound,
  Flag,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminNotification } from "@/services/notification.service";
import { cn } from "@/lib/utils";
import { FormattedNotificationMessage } from "@/components/notifications/formatted-notification-message";

const financialTypes = new Set([
  "FINANCIAL",
  "TRANSACTION",
  "PAYMENT",
  "ESCROW",
  "SUBSCRIPTION",
]);
const propertyTypes = new Set(["PROPERTY", "LISTING"]);
const verificationTypes = new Set(["KYC", "VERIFICATION"]);
const inspectionTypes = new Set(["INSPECTION", "INQUIRY", "VIEWING"]);
const bookingTypes = new Set(["BOOKING", "SHORTLET", "SHORTLET_BOOKING"]);

function notificationAppearance(type: string, priority: string) {
  if (priority === "URGENT" || priority === "CRITICAL" || type === "SECURITY") {
    return {
      icon: ShieldAlert,
      iconClass: "bg-destructive/10 text-destructive",
      badgeClass: "bg-destructive/10 text-destructive",
      label: type === "SECURITY" ? "Security" : "Critical",
    };
  }
  if (financialTypes.has(type)) {
    return {
      icon: Banknote,
      iconClass: "bg-primary text-primary-foreground",
      badgeClass: "bg-primary/10 text-primary",
      label: "Transaction",
    };
  }
  if (verificationTypes.has(type)) {
    return {
      icon: ListChecks,
      iconClass: "bg-secondary/15 text-secondary",
      badgeClass: "bg-secondary/15 text-secondary-hover",
      label: "KYC",
    };
  }
  if (propertyTypes.has(type)) {
    return {
      icon: Flag,
      iconClass: "bg-destructive/10 text-destructive",
      badgeClass: "bg-destructive/10 text-destructive",
      label: "Property",
    };
  }
  return {
    icon: CircleUserRound,
    iconClass: "bg-primary/10 text-primary",
    badgeClass: "bg-primary/10 text-primary",
    label: type === "GENERAL" ? "System" : type,
  };
}

function defaultAction(notification: AdminNotification) {
  if (verificationTypes.has(notification.type)) {
    return { label: "Review verification", href: "/admin/kyc" };
  }
  if (propertyTypes.has(notification.type)) {
    return { label: "View properties", href: "/admin/properties" };
  }
  if (inspectionTypes.has(notification.type)) {
    return { label: "View inspections", href: "/admin/inspections" };
  }
  if (bookingTypes.has(notification.type)) {
    return { label: "View bookings", href: "/admin/shortlet-bookings" };
  }
  return null;
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminNotificationItem({
  notification,
  pending,
  onMarkRead,
}: {
  notification: AdminNotification;
  pending: boolean;
  onMarkRead: (id: string) => void;
}) {
  const appearance = notificationAppearance(
    notification.type,
    notification.priority,
  );
  const Icon = appearance.icon;
  const fallbackAction = defaultAction(notification);
  const actionHref = notification.actionUrl ?? fallbackAction?.href;
  const actionLabel = notification.actionLabel ?? fallbackAction?.label;

  return (
    <article
      className={cn(
        "rounded-xl border px-4 py-4 transition-colors sm:px-5",
        !notification.isRead && "border-primary/25 bg-primary/5",
      )}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
        <div
          className={cn(
            "grid size-10 place-items-center rounded-full",
            appearance.iconClass,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold leading-5">{notification.title}</h3>
            <time className="shrink-0 text-xs font-medium text-muted-foreground">
              {formatNotificationTime(notification.createdAt)}
            </time>
          </div>
          <FormattedNotificationMessage
            message={notification.message}
            className="mt-1 max-w-3xl leading-6 text-muted-foreground"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className={appearance.badgeClass}>{appearance.label}</Badge>
            {!notification.isRead && (
              <span
                className="size-2 rounded-full bg-primary"
                aria-label="Unread notification"
              />
            )}
            <div className="ml-auto flex items-center gap-1">
              {actionHref && actionLabel && (
                <Button variant="link" size="sm" asChild>
                  <Link
                    href={actionHref}
                    onClick={() => {
                      if (!notification.isRead) onMarkRead(notification.id);
                    }}
                  >
                    {actionLabel}
                  </Link>
                </Button>
              )}
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => onMarkRead(notification.id)}
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
