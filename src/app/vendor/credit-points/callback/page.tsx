import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditPaymentCallback } from "@/features/vendor/components/credit-payments/payment-callback";

// Exact callback route configured by the backend during Paystack
// initialization. Query parameters such as reference and trxref are consumed
// by CreditPaymentCallback for server-side payment verification.
export default function VendorCreditPointsCallbackPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-80 w-full max-w-xl" />}>
      <CreditPaymentCallback />
    </Suspense>
  );
}
