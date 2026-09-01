import type { Metadata } from "next";
import { AdminActivityLogPage } from "@/features/admin/components/admin-activity-log-page";

export const metadata: Metadata = { title: "Activity Log | PropertyArk" };

export default function ActivityLogPage() {
  return <AdminActivityLogPage />;
}
