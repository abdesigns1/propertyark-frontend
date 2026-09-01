interface InspectionReferenceSource {
  id: string;
  inspectionReference?: string | null;
}

/**
 * Displays the backend-issued inspection/inquiry reference when available.
 * Older records fall back to one deterministic format shared by every dashboard.
 */
export function formatInspectionReference(
  inspection: InspectionReferenceSource,
) {
  const backendReference = inspection.inspectionReference?.trim();
  if (backendReference && /^(?:INS|INQ)[-_]/i.test(backendReference)) {
    return backendReference.toUpperCase();
  }

  const sourceId = backendReference || inspection.id;
  const compact = sourceId.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return sourceId.toUpperCase().startsWith("INS-")
    ? sourceId.toUpperCase()
    : `INS-${compact.slice(0, 4)}-${compact.slice(-5)}`;
}
