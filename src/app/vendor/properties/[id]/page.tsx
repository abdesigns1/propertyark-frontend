import { VendorPropertyPreview } from "@/features/vendor/components/vendor-property-preview";

export default async function VendorPropertyPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VendorPropertyPreview propertyId={id} />;
}
