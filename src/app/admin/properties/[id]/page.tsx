import { AdminPropertyDetailsPage } from "@/features/admin/components/admin-property-details-page";

export default async function PropertyDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminPropertyDetailsPage propertyId={id} />;
}
