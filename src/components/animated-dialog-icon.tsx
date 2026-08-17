"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AnimatedDialogIconProps = {
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
  size?: "default" | "large";
  className?: string;
};

export function AnimatedDialogIcon({
  icon: Icon,
  tone = "primary",
  size = "default",
  className,
}: AnimatedDialogIconProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        size === "large" ? "size-24" : "size-14",
        tone === "success" && "bg-success/10 text-success",
        tone === "warning" && "bg-warning/10 text-warning",
        tone === "destructive" && "bg-destructive/10 text-destructive",
        tone === "primary" && "bg-primary/10 text-primary",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.65, rotate: -16 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      {!reduceMotion && (
        <motion.span
          className={cn(
            "absolute inset-0 rounded-full border",
            tone === "success" && "border-success/40",
            tone === "warning" && "border-warning/40",
            tone === "destructive" && "border-destructive/40",
            tone === "primary" && "border-primary/35",
          )}
          animate={{ opacity: [0.7, 0], scale: [1, 1.35] }}
          transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
          aria-hidden="true"
        />
      )}
      <motion.span
        animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
        aria-hidden="true"
      >
        <Icon className={size === "large" ? "size-11" : "size-6"} />
      </motion.span>
    </motion.div>
  );
}
