import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { DashboardTopbar } from "@/features/dashboard/components/dashboard-topbar";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <DashboardTopbar />
      <main className="px-4 py-6 md:px-6 lg:ml-64 lg:px-7">{children}</main>
    </div>
  );
}
