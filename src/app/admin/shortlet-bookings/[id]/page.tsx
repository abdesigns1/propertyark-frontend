import { AdminShortletBookingDetailsPage } from "@/features/admin/components/admin-shortlet-booking-details-page";

export default async function ShortletBookingDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminShortletBookingDetailsPage bookingId={decodeURIComponent(id)} />;
}
