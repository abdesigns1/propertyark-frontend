import type { Metadata } from "next";
import { AdminInspectionDetailsPage } from "@/features/admin/components/admin-inspection-details-page";

export const metadata: Metadata = {
  title: "Inspection Details | PropertyArk",
};

export default async function InspectionDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminInspectionDetailsPage inspectionId={id} />;
}
