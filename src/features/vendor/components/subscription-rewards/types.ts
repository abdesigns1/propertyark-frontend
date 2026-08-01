import type { LucideIcon } from "lucide-react";

export type SubscriptionView = "manage" | "plans" | "checkout";
export type PlanId = "starter" | "professional" | "enterprise";

export interface SubscriptionPlan {
  id: PlanId;
  eyebrow: string;
  name: string;
  price: number | null;
  recommended?: boolean;
  features: string[];
  unavailable: string[];
}

export interface Reward {
  title: string;
  points: number;
  description: string;
  icon: LucideIcon;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface PaymentOption {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}
