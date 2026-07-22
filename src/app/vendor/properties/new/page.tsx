import { AddPropertyWizard } from "@/features/vendor/components/add-property-wizard";

export default async function AddPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft } = await searchParams;
  return <AddPropertyWizard initialDraftId={draft ?? null} />;
}
