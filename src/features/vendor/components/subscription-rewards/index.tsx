"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import { useAuthStore } from "@/store/auth.store";

import { SUBSCRIPTION_PLANS } from "./data";
import { CheckoutView } from "./checkout-view";
import { ManageView } from "./manage-view";
import { PlansView } from "./plans-view";
import type { PlanId, SubscriptionView } from "./types";

const DEFAULT_PLAN_ID: PlanId = "professional";
const INITIAL_LOYALTY_POINTS = 12_450;

/**
 * Coordinates the three subscription screens and their temporary UI state.
 *
 * Subscription endpoints are not available yet, so none of the state below is
 * persisted and no handler should imply that a real payment or redemption ran.
 * Replace these handlers with API mutations when the backend contract arrives.
 */
export function VendorSubscriptionRewards() {
  const user = useDashboardUser();
  const email = useAuthStore((state) => state.user?.email);

  const [view, setView] = useState<SubscriptionView>("manage");
  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [confirmedBilling, setConfirmedBilling] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [points, setPoints] = useState(INITIAL_LOYALTY_POINTS);

  const selectedPlan = useMemo(
    () =>
      SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) ??
      SUBSCRIPTION_PLANS[1],
    [planId],
  );

  const showView = (nextView: SubscriptionView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const choosePlan = (nextPlanId: PlanId) => {
    // Enterprise requires a sales-assisted flow instead of self-service checkout.
    if (nextPlanId === "enterprise") {
      toast.info(
        "Sales contact will be enabled when the subscription service is connected.",
      );
      return;
    }

    setPlanId(nextPlanId);
    showView("checkout");
  };

  const completeCheckoutPreview = () => {
    if (!confirmedBilling || !acceptedTerms) {
      toast.error(
        "Please confirm your billing information and accept the subscription terms.",
      );
      return;
    }

    // Preview-only: deliberately do not persist the selected plan or payment data.
    toast.success(
      "Subscription checkout preview completed. No payment was processed.",
    );
    showView("manage");
  };

  const redeemReward = (cost: number, title: string) => {
    if (points < cost) {
      toast.error("You do not have enough points for this reward.");
      return;
    }

    // This deduction lasts only for the current render session until an API exists.
    setPoints((currentPoints) => currentPoints - cost);
    toast.success(`${title} redeemed for this preview session.`);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1220px] flex-col gap-8 pb-12">
      {view === "manage" && (
        <ManageView
          points={points}
          autoRenew={autoRenew}
          onAutoRenew={setAutoRenew}
          onRedeem={redeemReward}
          onPlans={() => showView("plans")}
          onCheckout={() => showView("checkout")}
        />
      )}

      {view === "plans" && (
        <PlansView
          onChoose={choosePlan}
          onBack={() => showView("manage")}
        />
      )}

      {view === "checkout" && (
        <CheckoutView
          fullName={user.fullName}
          email={email ?? ""}
          plan={selectedPlan}
          paymentMethod={paymentMethod}
          onPaymentMethod={setPaymentMethod}
          confirmedBilling={confirmedBilling}
          acceptedTerms={acceptedTerms}
          onConfirmedBilling={setConfirmedBilling}
          onAcceptedTerms={setAcceptedTerms}
          onPay={completeCheckoutPreview}
          onBack={() => showView("plans")}
        />
      )}
    </section>
  );
}
