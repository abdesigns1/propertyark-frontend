import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
