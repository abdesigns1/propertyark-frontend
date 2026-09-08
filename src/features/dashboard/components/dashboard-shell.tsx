"use client";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useSidebarCollapse(
    "propertyark-dashboard-sidebar-collapsed",
  );

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
