import { AddPropertyWizard } from "@/features/vendor/components/add-property-wizard";

export default async function AddPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string; edit?: string }>;
}) {
  const { draft, edit } = await searchParams;
  return (
    <AddPropertyWizard
      initialDraftId={draft ?? null}
      initialPropertyId={edit ?? null}
    />
  );
}
