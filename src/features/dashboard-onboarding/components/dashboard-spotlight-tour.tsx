"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lightbulb, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  DashboardAudience,
  DashboardOnboardingStep,
} from "../lib/onboarding-steps";

const SPOTLIGHT_PADDING = 7;
const VIEWPORT_MARGIN = 16;
const CARD_GAP = 18;
const CARD_MAX_WIDTH = 360;
const CARD_ESTIMATED_HEIGHT = 390;
const SPOTLIGHT_OVERLAY = "color-mix(in srgb, var(--navbar) 72%, transparent)";

interface SpotlightMeasurement {
  top: number;
  left: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface CardPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

interface DashboardSpotlightTourProps {
  audience: DashboardAudience;
  isOpen: boolean;
  step: DashboardOnboardingStep;
  stepIndex: number;
  stepCount: number;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}

function findVisibleTarget(target: string) {
  const elements = document.querySelectorAll<HTMLElement>(
    `[data-onboarding="${target}"]`,
  );

  return Array.from(elements).find((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function resolveTarget(step: DashboardOnboardingStep) {
  const prefersMobileTarget = window.innerWidth < 1024 && step.mobileTarget;
  const targetOrder = prefersMobileTarget
    ? [step.mobileTarget, step.target]
    : [step.target, step.mobileTarget];

  for (const target of targetOrder) {
    if (!target) continue;
    const element = findVisibleTarget(target);
    if (element) return element;
  }

  return null;
}

function measureTarget(element: HTMLElement): SpotlightMeasurement {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = Math.max(VIEWPORT_MARGIN / 2, rect.left - SPOTLIGHT_PADDING);
  const top = Math.max(VIEWPORT_MARGIN / 2, rect.top - SPOTLIGHT_PADDING);
  const right = Math.min(
    viewportWidth - VIEWPORT_MARGIN / 2,
    rect.right + SPOTLIGHT_PADDING,
  );
  const bottom = Math.min(
    viewportHeight - VIEWPORT_MARGIN / 2,
    rect.bottom + SPOTLIGHT_PADDING,
  );

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    viewportWidth,
    viewportHeight,
  };
}

function getCardPosition(spotlight: SpotlightMeasurement): CardPosition {
  const width = Math.min(
    CARD_MAX_WIDTH,
    spotlight.viewportWidth - VIEWPORT_MARGIN * 2,
  );
  const spaceRight =
    spotlight.viewportWidth - spotlight.left - spotlight.width - CARD_GAP;
  const spaceLeft = spotlight.left - CARD_GAP;
  const spaceBelow =
    spotlight.viewportHeight - spotlight.top - spotlight.height - CARD_GAP;
  const clampTop = (top: number) =>
    Math.max(
      VIEWPORT_MARGIN,
      Math.min(top, spotlight.viewportHeight - CARD_ESTIMATED_HEIGHT),
    );

  if (spaceRight >= width + VIEWPORT_MARGIN) {
    const top = clampTop(spotlight.top);
    return {
      top,
      left: spotlight.left + spotlight.width + CARD_GAP,
      width,
      maxHeight: spotlight.viewportHeight - top - VIEWPORT_MARGIN,
    };
  }

  if (spaceLeft >= width + VIEWPORT_MARGIN) {
    const top = clampTop(spotlight.top);
    return {
      top,
      left: spotlight.left - width - CARD_GAP,
      width,
      maxHeight: spotlight.viewportHeight - top - VIEWPORT_MARGIN,
    };
  }

  if (spaceBelow >= 260) {
    const top = spotlight.top + spotlight.height + CARD_GAP;
    return {
      top,
      left: Math.max(
        VIEWPORT_MARGIN,
        Math.min(
          spotlight.left,
          spotlight.viewportWidth - width - VIEWPORT_MARGIN,
        ),
      ),
      width,
      maxHeight: spotlight.viewportHeight - top - VIEWPORT_MARGIN,
    };
  }

  const maxHeight = Math.max(260, spotlight.top - CARD_GAP - VIEWPORT_MARGIN);
  return {
    top: VIEWPORT_MARGIN,
    left: Math.max(
      VIEWPORT_MARGIN,
      Math.min(
        spotlight.left,
        spotlight.viewportWidth - width - VIEWPORT_MARGIN,
      ),
    ),
    width,
    maxHeight,
  };
}

export function DashboardSpotlightTour({
  audience,
  isOpen,
  step,
  stepIndex,
  stepCount,
  onBack,
  onClose,
  onNext,
}: DashboardSpotlightTourProps) {
  const [spotlight, setSpotlight] = useState<SpotlightMeasurement | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const StepIcon = step.icon;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === stepCount - 1;
  const spotlightTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 340, damping: 30 };
  const cardPosition = useMemo(
    () => (spotlight ? getCardPosition(spotlight) : null),
    [spotlight],
  );

  useEffect(() => {
    if (!isOpen) return;

    let target: HTMLElement | null = null;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;

    const updateMeasurement = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        target = resolveTarget(step);
        if (target) setSpotlight(measureTarget(target));
      });
    };

    const initialFrame = window.requestAnimationFrame(() => {
      target = resolveTarget(step);
      target?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
      updateMeasurement();

      if (target && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(updateMeasurement);
        resizeObserver.observe(target);
      }
    });

    window.addEventListener("resize", updateMeasurement);
    window.addEventListener("scroll", updateMeasurement, true);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateMeasurement);
      window.removeEventListener("scroll", updateMeasurement, true);
    };
  }, [isOpen, reduceMotion, step]);

  useEffect(() => {
    if (!isOpen) return;

    const dashboard = document.querySelector<HTMLElement>(
      "[data-dashboard-shell]",
    );
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dashboard?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      cardRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      dashboard?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !spotlight || !cardPosition) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="fixed inset-0 cursor-default bg-transparent"
          onClick={onClose}
          tabIndex={-1}
          aria-label="Skip dashboard walkthrough"
        />

        <div aria-hidden="true" className="pointer-events-none">
          <motion.div
            className="fixed inset-x-0 top-0"
            initial={false}
            animate={{ height: spotlight.top }}
            transition={spotlightTransition}
            style={{ backgroundColor: SPOTLIGHT_OVERLAY }}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0"
            initial={false}
            animate={{
              top: spotlight.top + spotlight.height,
            }}
            transition={spotlightTransition}
            style={{ backgroundColor: SPOTLIGHT_OVERLAY }}
          />
          <motion.div
            className="fixed left-0"
            initial={false}
            animate={{
              top: spotlight.top,
              width: spotlight.left,
              height: spotlight.height,
            }}
            transition={spotlightTransition}
            style={{ backgroundColor: SPOTLIGHT_OVERLAY }}
          />
          <motion.div
            className="fixed right-0"
            initial={false}
            animate={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              height: spotlight.height,
            }}
            transition={spotlightTransition}
            style={{ backgroundColor: SPOTLIGHT_OVERLAY }}
          />
          <motion.div
            className="fixed rounded-xl ring-2 ring-primary-foreground shadow-[0_0_0_3px_var(--primary)]"
            initial={false}
            animate={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
            }}
            transition={spotlightTransition}
          />
        </div>

        <motion.section
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-tour-title"
          aria-describedby="dashboard-tour-description"
          tabIndex={-1}
          className="fixed overflow-y-auto rounded-2xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none"
          style={{
            left: cardPosition.left,
            width: cardPosition.width,
            maxHeight: cardPosition.maxHeight,
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, top: cardPosition.top, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden bg-primary p-5 text-primary-foreground">
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-12 size-28 rounded-full border border-primary-foreground/20"
            />
            <div className="relative flex items-start justify-between gap-4">
              <motion.div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/25"
                animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                transition={{
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <StepIcon className="size-6" aria-hidden="true" />
              </motion.div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                onClick={onClose}
                aria-label="Skip dashboard walkthrough"
              >
                <X />
              </Button>
            </div>
            <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/75">
              {audience === "vendor"
                ? "Vendor walkthrough"
                : "User walkthrough"}
            </p>
          </div>

          <div className="p-5">
            <div className="mb-5 flex items-center gap-3">
              <Progress
                value={((stepIndex + 1) / stepCount) * 100}
                aria-label={`Walkthrough step ${stepIndex + 1} of ${stepCount}`}
                className="h-1.5"
              />
              <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                {stepIndex + 1} / {stepCount}
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.id}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              >
                <Badge variant="secondary">{step.eyebrow}</Badge>
                <h2
                  id="dashboard-tour-title"
                  className="mt-3 text-xl font-semibold leading-tight"
                >
                  {step.title}
                </h2>
                <p
                  id="dashboard-tour-description"
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                >
                  {step.description}
                </p>
                <div className="mt-4 flex gap-2.5 rounded-xl bg-muted/60 p-3">
                  <Lightbulb
                    className="mt-0.5 size-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    {step.tip}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Skip
              </Button>
              <div className="ml-auto flex items-center gap-2">
                {!isFirstStep && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                  >
                    <ArrowLeft data-icon="inline-start" />
                    Back
                  </Button>
                )}
                <Button type="button" size="sm" onClick={onNext}>
                  {isLastStep ? (
                    <>
                      Finish
                      <Check data-icon="inline-end" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight data-icon="inline-end" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
