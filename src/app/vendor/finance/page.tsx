import { CreditTransactionHistory } from "@/features/vendor/components/credit-payments/transaction-history";

// The original Finance page is intentionally preserved for future use.
// import { VendorFinance } from "@/features/vendor/components/vendor-finance";

export default function VendorFinancePage() {
  return <CreditTransactionHistory />;

  // Restore the Finance interface later with:
  // return <VendorFinance />;
}
