"use client";

import { useAuthStore } from "@/store/auth.store";

export function useDashboardUser() {
  const user = useAuthStore((state) => state.user);
  const fullName = user?.fullName || "PropertyArk User";
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return {
    fullName,
    firstName: fullName.split(/\s+/)[0],
    initials: initials || "PA",
    avatarUrl: user?.avatarUrl ?? undefined,
  };
}
