"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAdminKycStats } from "@/features/admin/hooks/use-admin-dashboard";
import { useAdminNotifications } from "@/features/admin/hooks/use-admin-notifications";
import { contactMessageKeys } from "@/features/messages/hooks/use-contact-messages";
import { newsletterKeys } from "@/features/newsletter/hooks/use-newsletter";
import { professionalServiceKeys } from "@/features/professional-services/hooks/use-professional-services";
import { adminService } from "@/services/admin.service";
import { chatService } from "@/services/chat.service";
import { contactService } from "@/services/contact.service";
import { newsletterService } from "@/services/newsletter.service";
import { professionalServiceService } from "@/services/professional-service.service";

const INDICATOR_REFRESH_INTERVAL = 20_000;
const INBOX_SEEN_EVENT = "propertyark:admin-inbox-seen";

type InboxIndicator = "contacts" | "newsletter" | "professionalServices";
type SeenMarkers = Record<InboxIndicator, number | null>;

const inboxIndicatorConfig: Record<
  InboxIndicator,
  { href: string; storageKey: string }
> = {
  contacts: {
    href: "/admin/contacts",
    storageKey: "propertyark-admin-contacts-seen-at",
  },
  newsletter: {
    href: "/admin/newsletter",
    storageKey: "propertyark-admin-newsletter-seen-at",
  },
  professionalServices: {
    href: "/admin/professional-services",
    storageKey: "propertyark-admin-professional-services-seen-at",
  },
};

function getSeenMarkersSnapshot() {
  return (Object.keys(inboxIndicatorConfig) as InboxIndicator[])
    .map((key) => window.localStorage.getItem(inboxIndicatorConfig[key].storageKey) ?? "")
    .join("|");
}

function getServerSeenMarkersSnapshot() {
  return "||";
}

function subscribeToSeenMarkers(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(INBOX_SEEN_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(INBOX_SEEN_EVENT, onStoreChange);
  };
}

function parseSeenMarkers(snapshot: string): SeenMarkers {
  const values = snapshot.split("|");

  return (Object.keys(inboxIndicatorConfig) as InboxIndicator[]).reduce(
    (markers, key, index) => {
      const value = Number(values[index]);
      markers[key] = Number.isFinite(value) && value > 0 ? value : null;
      return markers;
    },
    {} as SeenMarkers,
  );
}

function timestamp(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function latestTimestamp(values: Array<string | null | undefined>) {
  return values.reduce<number>((latest, value) => {
    const parsed = timestamp(value);
    return parsed === null ? latest : Math.max(latest, parsed);
  }, 0);
}

function countNewItems(
  values: Array<string | null | undefined>,
  seenAt: number | null,
) {
  if (seenAt === null) return 0;
  return values.filter((value) => {
    const parsed = timestamp(value);
    return parsed !== null && parsed > seenAt;
  }).length;
}

export function useAdminNotificationIndicators() {
  const pathname = usePathname();
  const seenMarkersSnapshot = useSyncExternalStore(
    subscribeToSeenMarkers,
    getSeenMarkersSnapshot,
    getServerSeenMarkersSnapshot,
  );
  const seenMarkers = useMemo(
    () => parseSeenMarkers(seenMarkersSnapshot),
    [seenMarkersSnapshot],
  );
  const notifications = useAdminNotifications();
  const kyc = useAdminKycStats();
  const properties = useQuery({
    queryKey: ["admin", "navigation-indicators", "pending-properties"],
    queryFn: () =>
      adminService.getPropertyManagement({
        page: 1,
        limit: 1,
        status: "PENDING",
      }),
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
  const support = useQuery({
    queryKey: ["admin", "navigation-indicators", "support"],
    queryFn: async () => {
      const [active, pending] = await Promise.all([
        chatService.getSessions("SUPPORT", "ACTIVE"),
        chatService.getPendingSupport(),
      ]);
      return {
        unread: active.reduce(
          (total, session) => total + session.unreadCount,
          0,
        ),
        pending: pending.length,
      };
    },
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
  const contacts = useQuery({
    queryKey: contactMessageKeys.all,
    queryFn: contactService.getAll,
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
  const newsletter = useQuery({
    queryKey: newsletterKeys.subscribers,
    queryFn: newsletterService.getSubscribers,
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
  const professionalServices = useQuery({
    queryKey: professionalServiceKeys.all,
    queryFn: professionalServiceService.getAll,
    staleTime: INDICATOR_REFRESH_INTERVAL,
    refetchInterval: INDICATOR_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const collections: Record<
      InboxIndicator,
      { dates: Array<string | null | undefined>; loaded: boolean }
    > = {
      contacts: {
        dates: (contacts.data ?? []).map((item) => item.createdAt),
        loaded: contacts.isSuccess,
      },
      newsletter: {
        dates: (newsletter.data ?? []).map((item) => item.subscribedAt),
        loaded: newsletter.isSuccess,
      },
      professionalServices: {
        dates: (professionalServices.data ?? []).map((item) => item.createdAt),
        loaded: professionalServices.isSuccess,
      },
    };
    let changed = false;
    (Object.keys(collections) as InboxIndicator[]).forEach((key) => {
      const collection = collections[key];
      if (!collection.loaded) return;

      const config = inboxIndicatorConfig[key];
      const latest = latestTimestamp(collection.dates);
      const isViewingInbox =
        pathname === config.href || pathname.startsWith(`${config.href}/`);
      const shouldEstablishBaseline = seenMarkers[key] === null;
      const shouldMarkLatestSeen =
        isViewingInbox && latest > (seenMarkers[key] ?? 0);

      if (!shouldEstablishBaseline && !shouldMarkLatestSeen) return;

      const nextSeenAt = latest || Date.now();
      window.localStorage.setItem(config.storageKey, String(nextSeenAt));
      changed = true;
    });

    if (changed) {
      window.dispatchEvent(new Event(INBOX_SEEN_EVENT));
    }
  }, [
    contacts.data,
    contacts.isSuccess,
    newsletter.data,
    newsletter.isSuccess,
    pathname,
    professionalServices.data,
    professionalServices.isSuccess,
    seenMarkers,
  ]);

  const unreadNotifications =
    notifications.data?.notifications.filter((item) => !item.isRead).length ??
    0;
  const kycPending = kyc.data?.pending ?? 0;
  const propertyPending = properties.data?.stats.pendingReviews ?? 0;
  const supportUnread =
    (support.data?.unread ?? 0) + (support.data?.pending ?? 0);
  const contactMessagesNew = countNewItems(
    (contacts.data ?? []).map((item) => item.createdAt),
    seenMarkers.contacts,
  );
  const newsletterNew = countNewItems(
    (newsletter.data ?? []).map((item) => item.subscribedAt),
    seenMarkers.newsletter,
  );
  const professionalServicesNew = countNewItems(
    (professionalServices.data ?? []).map((item) => item.createdAt),
    seenMarkers.professionalServices,
  );
  const operationalTotal = kycPending + propertyPending + supportUnread;

  return {
    contactMessagesNew,
    unreadNotifications,
    kycPending,
    newsletterNew,
    propertyPending,
    professionalServicesNew,
    supportUnread,
    notificationTotal: Math.max(unreadNotifications, operationalTotal),
  };
}
