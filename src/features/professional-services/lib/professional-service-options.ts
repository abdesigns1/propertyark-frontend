import type { ProfessionalServiceType } from "@/services/professional-service.service";

export const PROFESSIONAL_SERVICE_OPTIONS = [
  { label: "Accountant", value: "accountant", apiValue: "ACCOUNTANT" },
  {
    label: "Mortgage Broker",
    value: "mortgage-broker",
    apiValue: "MORTGAGE_BROKER",
  },
  { label: "Legal", value: "legal", apiValue: "LEGAL" },
  { label: "Insurance", value: "insurance", apiValue: "INSURANCE" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: string;
  apiValue: ProfessionalServiceType;
}>;

export type ProfessionalServiceValue =
  (typeof PROFESSIONAL_SERVICE_OPTIONS)[number]["value"];

export function professionalServiceApiValue(value: ProfessionalServiceValue) {
  return (
    PROFESSIONAL_SERVICE_OPTIONS.find((option) => option.value === value)
      ?.apiValue ?? "ACCOUNTANT"
  );
}

export function professionalServiceLabel(value: ProfessionalServiceType) {
  return (
    PROFESSIONAL_SERVICE_OPTIONS.find((option) => option.apiValue === value)
      ?.label ?? "Accountant"
  );
}

export function formatProfessionalServiceDate(
  value: string | null,
  options: { includeTime?: boolean } = {},
) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(options.includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}
