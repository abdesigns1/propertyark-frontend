import type { Metadata } from "next";
import { AdminProfessionalServiceDetailsPage } from "@/features/admin/components/admin-professional-service-details-page";

export const metadata: Metadata = {
  title: "Professional Service Request | PropertyArk Admin",
};

export default async function ProfessionalServiceDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProfessionalServiceDetailsPage requestId={id} />;
}
