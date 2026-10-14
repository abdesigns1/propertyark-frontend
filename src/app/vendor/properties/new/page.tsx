import { AddPropertyWizard } from "@/features/vendor/components/add-property-wizard";
import { VendorPropertyAccessGuard } from "@/features/vendor/components/vendor-property-access-guard";

export default async function AddPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string; edit?: string }>;
}) {
  const { draft, edit } = await searchParams;
  return (
    <VendorPropertyAccessGuard>
      <AddPropertyWizard
        initialDraftId={draft ?? null}
        initialPropertyId={edit ?? null}
      />
    </VendorPropertyAccessGuard>
  );
}
