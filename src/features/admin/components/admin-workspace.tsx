"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboardHeader } from "@/features/admin/components/admin-dashboard-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";

export function AdminWorkspace({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const hasAdminAccess =
    isAuthenticated && (role === "admin" || role === "staff");
  const [collapsed, setCollapsed] = useSidebarCollapse(
    "propertyark-admin-sidebar-collapsed",
  );

  useEffect(() => {
    if (ready && !hasAdminAccess) router.replace("/admin/login");
  }, [hasAdminAccess, ready, router]);

  if (!ready || !hasAdminAccess) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-6 py-10">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </main>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-background transition-[padding] duration-200",
        collapsed ? "lg:pl-20" : "lg:pl-64",
      )}
    >
      <div
        className={cn(
          "fixed inset-y-0 left-0 hidden h-dvh overflow-hidden transition-[width] duration-200 lg:block",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <AdminSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>
      <AdminDashboardHeader />
      {children}
    </div>
  );
}
