"use client";

import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import {
  containerVariants,
  itemVariants,
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
  slideInFromBottom,
  scaleInUp,
} from "@/lib/animations";

interface AnimatedElementProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  stagger?: boolean;
}

/**
 * Animated container for staggered children
 */
export const AnimatedContainer = ({
  children,
  className,
  ...props
}: AnimatedElementProps) => {
  const shouldReduceMotion = useReducedMotion();
  return <motion.div
    className={className}
    initial={shouldReduceMotion ? false : "hidden"}
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={containerVariants}
    {...props}
  >
    {children}
  </motion.div>;
};

/**
 * Animated item for use inside AnimatedContainer
 */
export const AnimatedItem = ({
  children,
  className,
  ...props
}: AnimatedElementProps) => (
  <motion.div className={className} variants={itemVariants} {...props}>
    {children}
  </motion.div>
);

/**
 * Fade-in animation wrapper
 */
export const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  ...props
}: AnimatedElementProps) => {
  const shouldReduceMotion = useReducedMotion();
  return <motion.div
    className={className}
    initial={shouldReduceMotion ? false : { opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ delay, duration }}
    {...props}
  >
    {children}
  </motion.div>;
};

/**
 * Slide-in from left animation
 */
export const SlideInLeft = ({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={slideInFromLeft}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Slide-in from right animation
 */
export const SlideInRight = ({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={slideInFromRight}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Slide-in from top animation
 */
export const SlideInTop = ({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={slideInFromTop}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Slide-in from bottom animation
 */
export const SlideInBottom = ({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedElementProps) => {
  const shouldReduceMotion = useReducedMotion();
  return <motion.div
    className={className}
    initial={shouldReduceMotion ? false : "hidden"}
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={slideInFromBottom}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>;
};

/**
 * Scale-up animation with fade
 */
export const ScaleUp = ({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={scaleInUp}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Hover effect wrapper - scales on hover
 */
export const HoverScale = ({
  children,
  className,
  ...props
}: AnimatedElementProps) => (
  <motion.div
    className={className}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 10 }}
    {...props}
  >
    {children}
  </motion.div>
);
