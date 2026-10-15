import type { Metadata } from "next";
import { AdminContactMessageDetailsPage } from "@/features/admin/components/admin-contact-message-details-page";

export const metadata: Metadata = {
  title: "Contact Message | PropertyArk Admin",
};

export default async function AdminContactMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminContactMessageDetailsPage contactId={id} />;
}
