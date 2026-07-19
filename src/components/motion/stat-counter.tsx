"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const displayValue = useTransform(
    count,
    (current) => `${prefix}${current.toFixed(decimals)}${suffix}`,
  );
  const finalValue = `${prefix}${value.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration: 1.6,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [count, isInView, shouldReduceMotion, value]);

  return (
    <span ref={ref}>
      <span className="sr-only">{finalValue}</span>
      <motion.span aria-hidden>{displayValue}</motion.span>
    </span>
  );
}
