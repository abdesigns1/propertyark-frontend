import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyerAccountSettings } from "@/features/dashboard/components/buyer-account-settings";

export default function BuyerSettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[640px] w-full rounded-xl" />}>
      <BuyerAccountSettings />
    </Suspense>
  );
}
