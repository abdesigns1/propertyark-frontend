import { AdminKycReviewPage } from "@/features/admin/components/admin-kyc-review-page";

export default async function KycReviewRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminKycReviewPage requestId={id} />;
}
