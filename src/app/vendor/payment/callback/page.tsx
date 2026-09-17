import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditPaymentCallback } from "@/features/vendor/components/credit-payments/payment-callback";

export default function VendorPaymentCallbackPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-80 w-full max-w-xl" />}>
      <CreditPaymentCallback />
    </Suspense>
  );
}
