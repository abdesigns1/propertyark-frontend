import type { AdminUser } from "@/services/admin.service";

export function getUserInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatAdminDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getVerificationLabel(user: AdminUser) {
  if (!user.isVerified) return "Unverified";
  if (user.role === "VENDOR" && user.ninVerificationStatus === "PENDING") {
    return "Pending";
  }
  return "Verified";
}
