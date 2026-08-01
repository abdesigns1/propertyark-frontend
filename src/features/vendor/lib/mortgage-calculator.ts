export type PaymentFrequency = "monthly" | "quarterly" | "yearly";

export interface MortgageValues {
  propertyPrice: number;
  downPayment: number;
  annualRate: number;
  termMonths: number;
  frequency: PaymentFrequency;
  householdIncome: number;
}

export const DEFAULT_MORTGAGE_VALUES: MortgageValues = {
  propertyPrice: 80_000_000,
  downPayment: 20_000_000,
  annualRate: 18,
  termMonths: 180,
  frequency: "monthly",
  householdIncome: 4_000_000,
};

const PAYMENTS_PER_YEAR: Record<PaymentFrequency, number> = {
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

/**
 * Calculates an amortized loan payment for the selected payment frequency.
 * The standard fixed-rate formula is used, with a separate zero-interest path
 * to avoid dividing by zero.
 */
export function calculateMortgage(values: MortgageValues) {
  const loanAmount = Math.max(0, values.propertyPrice - values.downPayment);
  const paymentsPerYear = PAYMENTS_PER_YEAR[values.frequency];
  const years = values.termMonths / 12;
  const numberOfPayments = years * paymentsPerYear;
  const periodicRate = values.annualRate / 100 / paymentsPerYear;
  const payment =
    periodicRate === 0
      ? loanAmount / numberOfPayments
      : loanAmount *
        ((periodicRate * (1 + periodicRate) ** numberOfPayments) /
          ((1 + periodicRate) ** numberOfPayments - 1));
  // Invalid or incomplete input must never leak NaN/Infinity into the UI.
  const safePayment = Number.isFinite(payment) ? payment : 0;
  const totalRepayment = safePayment * numberOfPayments;

  return {
    loanAmount,
    payment: safePayment,
    totalRepayment,
    totalInterest: Math.max(0, totalRepayment - loanAmount),
    monthlyEquivalent: totalRepayment / values.termMonths,
  };
}

export function parseMortgageInput(value: string) {
  // Inputs are displayed with separators, so remove formatting before storage.
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

export function formatMortgageInput(value: number) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatPercent(value: number) {
  const formatted = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 1,
  }).format(value);
  return `${formatted}%`;
}

export function frequencyLabel(frequency: PaymentFrequency) {
  return FREQUENCY_LABELS[frequency];
}

export function termSliderValue(values: MortgageValues) {
  // Monthly mode exposes months; other frequencies expose the equivalent years.
  return values.frequency === "monthly"
    ? values.termMonths
    : Math.round(values.termMonths / 12);
}

export function termDisplayValue(values: MortgageValues) {
  return values.frequency === "monthly"
    ? values.termMonths
    : values.termMonths / 12;
}

export function termSummary(values: MortgageValues) {
  return values.frequency === "monthly"
    ? `${values.termMonths} Mos`
    : `${values.termMonths / 12} Yrs`;
}
