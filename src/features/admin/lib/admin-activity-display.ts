import type { AdminActivity } from "@/services/activity.service";

export function adminActivityHref(activity: AdminActivity) {
  const entityId = activity.entityId;
  const actorId = activity.actor.id;
  const content = `${activity.entityType} ${activity.action}`;

  if (/KYC|NIN|VERIFICATION/.test(content))
    return entityId
      ? `/admin/kyc/${entityId}`
      : actorId
        ? `/admin/users/${actorId}`
        : "/admin/kyc";
  if (/PROPERTY|LISTING/.test(content))
    return entityId ? `/admin/properties/${entityId}` : "/admin/properties";
  if (/INSPECTION|INQUIRY|VIEWING/.test(content))
    return entityId ? `/admin/inspections/${entityId}` : "/admin/inspections";
  if (/SHORTLET|BOOKING/.test(content))
    return entityId
      ? `/admin/shortlet-bookings/${entityId}`
      : "/admin/shortlet-bookings";
  if (/USER|VENDOR|REGISTER|SIGN_UP/.test(content))
    return actorId
      ? `/admin/users/${actorId}`
      : entityId
        ? `/admin/users/${entityId}`
        : "/admin/users";
  if (/PAYMENT|TRANSACTION|ESCROW/.test(content)) return "/admin/reports";
  return null;
}

export function formatActivityTime(value: string) {
  const date = new Date(value);
  const difference = Date.now() - date.getTime();
  if (difference >= 0 && difference < 60_000) return "Just now";
  if (difference >= 0 && difference < 3_600_000)
    return `${Math.floor(difference / 60_000)}m ago`;
  if (difference >= 0 && difference < 86_400_000)
    return `${Math.floor(difference / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
