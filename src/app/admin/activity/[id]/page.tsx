import type { Metadata } from "next";
import { AdminActivityDetailsPage } from "@/features/admin/components/admin-activity-details-page";

export const metadata: Metadata = { title: "Activity Details | PropertyArk" };

export default async function ActivityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminActivityDetailsPage activityId={id} />;
}
