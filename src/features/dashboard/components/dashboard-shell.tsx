"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { useAuthSessionReady } from "@/hooks/use-auth-session-ready";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useAuthSessionReady();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const expectedRole = pathname.startsWith("/vendor") ? "vendor" : "buyer";
  const hasAccess =
    isAuthenticated &&
    (expectedRole === "vendor"
      ? role === "vendor"
      : role === "buyer" || role === "user");
  const [collapsed, setCollapsed] = useSidebarCollapse(
    "propertyark-dashboard-sidebar-collapsed",
  );

  useEffect(() => {
    if (ready && !hasAccess) {
      const redirect = `${pathname}${window.location.search}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [hasAccess, pathname, ready, router]);

  if (!ready || !hasAccess) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-6 py-10">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <DashboardTopbar collapsed={collapsed} />
      <main
        className={cn(
          "px-4 py-6 transition-[margin] duration-200 md:px-6 lg:px-7",
          collapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        {children}
      </main>
    </div>
  );
}
