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

const financialTypes = new Set([
  "FINANCIAL",
  "TRANSACTION",
  "PAYMENT",
  "ESCROW",
  "SUBSCRIPTION",
]);
const propertyTypes = new Set(["PROPERTY", "LISTING"]);
const verificationTypes = new Set(["KYC", "VERIFICATION"]);

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
    return { label: "Start Review", href: "/admin/kyc" };
  }
  if (propertyTypes.has(notification.type)) {
    return { label: "Audit Price", href: "/admin/properties" };
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
  onDismiss,
}: {
  notification: AdminNotification;
  pending: boolean;
  onDismiss: (id: string) => void;
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
          <p className="mt-1 max-w-3xl leading-6 text-muted-foreground">
            {notification.message}
          </p>
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
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              )}
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => onDismiss(notification.id)}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
