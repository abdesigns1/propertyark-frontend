import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
