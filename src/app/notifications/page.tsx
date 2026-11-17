"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSessionReady } from "@/hooks/use-auth-session-ready";
import { useAuthStore, type Role } from "@/store/auth.store";

function notificationPathFor(role: Role | null) {
  if (role === "admin" || role === "staff") {
    return "/admin/notifications";
  }

  if (role === "vendor") {
    return "/vendor/notifications";
  }

  return "/buyer/notifications";
}

/**
 * Canonical destination used by notification emails. The backend cannot know
 * which dashboard route will be active when a recipient opens an email, so
 * this page resolves the destination from the restored browser session.
 */
export default function NotificationsRedirectPage() {
  const router = useRouter();
  const ready = useAuthSessionReady();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (!ready) return;

    if (isAuthenticated && accessToken && role) {
      router.replace(notificationPathFor(role));
      return;
    }

    const loginPath =
      role === "admin" || role === "staff" ? "/admin/login" : "/login";
    router.replace(`${loginPath}?redirect=${encodeURIComponent("/notifications")}`);
  }, [accessToken, isAuthenticated, ready, role, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 px-6 py-10">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-72 w-full" />
    </main>
  );
}
