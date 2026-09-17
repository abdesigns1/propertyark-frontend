import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditPaymentCallback } from "@/features/vendor/components/credit-payments/payment-callback";

// Compatibility route for Paystack configurations that use the application-
// level callback instead of the vendor-scoped callback URL.
export default function PaymentCallbackPage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <Suspense fallback={<Skeleton className="mx-auto h-80 w-full max-w-xl" />}>
        <CreditPaymentCallback />
      </Suspense>
    </main>
  );
}
