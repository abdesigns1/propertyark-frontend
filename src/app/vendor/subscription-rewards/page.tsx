import { CreditPointsPayment } from "@/features/vendor/components/credit-payments/credit-points-payment";

// The subscription and rewards interface is intentionally preserved for a
// future subscription API integration.
// import { VendorSubscriptionRewards } from "@/features/vendor/components/vendor-subscription-rewards";

export default function VendorSubscriptionRewardsPage() {
  return <CreditPointsPayment />;
}

// To restore the preserved subscription UI later, render:
// <VendorSubscriptionRewards />
