"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccountKey } from "@/lib/account-identity";
import { useAuthStore } from "@/store/auth.store";
import { DashboardSpotlightTour } from "./dashboard-spotlight-tour";
import {
  getDashboardOnboardingSteps,
  type DashboardAudience,
} from "../lib/onboarding-steps";

const TOUR_STORAGE_PREFIX = "propertyark:dashboard-onboarding:v1";

interface DashboardOnboardingContextValue {
  openTour: () => void;
}

const DashboardOnboardingContext =
  createContext<DashboardOnboardingContextValue | null>(null);

function getStorageKey(accountKey: string) {
  return `${TOUR_STORAGE_PREFIX}:${accountKey}`;
}

function hasSeenTour(accountKey: string) {
  try {
    return window.localStorage.getItem(getStorageKey(accountKey)) === "seen";
  } catch {
    return false;
  }
}

function rememberTour(accountKey: string | null) {
  if (!accountKey) return;

  try {
    window.localStorage.setItem(getStorageKey(accountKey), "seen");
  } catch {
    // The tour remains usable when storage is blocked by the browser.
  }
}

export function DashboardOnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const accountKey = useAccountKey();
  const role = useAuthStore((state) => state.role);
  const audience: DashboardAudience = role === "vendor" ? "vendor" : "user";
  const steps = useMemo(
    () => getDashboardOnboardingSteps(audience),
    [audience],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const closeTour = useCallback(() => {
    rememberTour(accountKey);
    setIsOpen(false);
  }, [accountKey]);

  const openTour = useCallback(() => {
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!accountKey || hasSeenTour(accountKey)) return;

    const frame = window.requestAnimationFrame(openTour);
    return () => window.cancelAnimationFrame(frame);
  }, [accountKey, openTour]);

  function goForward() {
    if (stepIndex === steps.length - 1) {
      closeTour();
      return;
    }
    setStepIndex((current) => current + 1);
  }

  const step = steps[stepIndex] ?? steps[0];
  const contextValue = useMemo(() => ({ openTour }), [openTour]);

  return (
    <DashboardOnboardingContext.Provider value={contextValue}>
      {children}
      <DashboardSpotlightTour
        audience={audience}
        isOpen={isOpen}
        step={step}
        stepIndex={stepIndex}
        stepCount={steps.length}
        onBack={() => setStepIndex((current) => Math.max(0, current - 1))}
        onClose={closeTour}
        onNext={goForward}
      />
    </DashboardOnboardingContext.Provider>
  );
}

export function useDashboardOnboarding() {
  const context = useContext(DashboardOnboardingContext);
  if (!context) {
    throw new Error(
      "useDashboardOnboarding must be used inside DashboardOnboardingProvider",
    );
  }
  return context;
}
