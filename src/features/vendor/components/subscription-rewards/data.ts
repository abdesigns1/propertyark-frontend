import {
  Banknote,
  Building2,
  CreditCard,
  Crown,
  FileChartColumn,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import type {
  Faq,
  PaymentOption,
  Reward,
  SubscriptionPlan,
} from "./types";

export const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    eyebrow: "Entry level",
    name: "Starter",
    price: 25_000,
    features: [
      "5 Property Listings",
      "Basic Analytics Dashboard",
      "Standard Email Support",
    ],
    unavailable: ["Featured Properties"],
  },
  {
    id: "professional",
    eyebrow: "Growth",
    name: "Professional",
    price: 50_000,
    recommended: true,
    features: [
      "25 Property Listings",
      "Advanced Occupancy Analytics",
      "Lead Management System",
      "3 Featured Property Slots",
      "Priority 24/7 Support",
    ],
    unavailable: [],
  },
  {
    id: "enterprise",
    eyebrow: "At scale",
    name: "Enterprise",
    price: null,
    features: [
      "Unlimited Listings",
      "Multi-user Team Access",
      "Premium Marketplace Visibility",
      "Dedicated Account Manager",
      "API Access & Integration",
    ],
    unavailable: [],
  },
];

export const SUBSCRIPTION_FAQS: Faq[] = [
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "Yes. You can change your subscription from your dashboard. Upgrades take effect immediately, while downgrades apply at the end of the billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "The planned checkout supports cards, Paystack, Flutterwave, and bank transfer. Payment processing will be enabled when the subscription API is connected.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No. The full subscription amount and any applicable tax will be shown before payment.",
  },
  {
    question: "How does featured visibility work?",
    answer:
      "A featured boost moves an eligible property into a higher-visibility placement for the reward period.",
  },
];

export const REWARDS: Reward[] = [
  {
    title: "Featured Property Boost",
    points: 5_000,
    description:
      "Move any property to the top of search results for 7 consecutive days.",
    icon: Building2,
  },
  {
    title: "Premium Listing Badge",
    points: 10_000,
    description:
      "Add a premium verification badge to your profile for 30 days.",
    icon: Crown,
  },
  {
    title: "Expert Market Report",
    points: 3_000,
    description:
      "Receive a focused analytical report for your selected property market.",
    icon: FileChartColumn,
  },
];

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "card",
    label: "Credit/Debit Card",
    description: "Saved card ending in **** 4521",
    icon: CreditCard,
  },
  {
    id: "paystack",
    label: "Paystack",
    description: "Secure web payment via Paystack",
    icon: WalletCards,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Manual transfer to PropertyArk corporate account",
    icon: Banknote,
  },
  {
    id: "flutterwave",
    label: "Flutterwave",
    description: "Mobile money and international payments",
    icon: ReceiptText,
  },
];

export const CURRENT_PLAN_FEATURES = [
  "25 Property Listings",
  "Advanced Lead Management",
  "Priority 24/7 Support",
  "Real-time Calendar Sync",
];

export const POINT_ACTIVITY = [
  {
    activity: "Property Approved",
    status: "Credited",
    amount: "+500",
    date: "June 25, 2026",
  },
  {
    activity: "5-Star Guest Review",
    status: "Credited",
    amount: "+200",
    date: "June 22, 2026",
  },
  {
    activity: "Featured Boost Redeemed",
    status: "Debited",
    amount: "-5,000",
    date: "June 18, 2026",
  },
  {
    activity: "Vendor Identity Verified",
    status: "Credited",
    amount: "+1,000",
    date: "June 12, 2026",
  },
];

export const RECENT_INVOICES = [
  { id: "INV-2026-00125", date: "June 12, 2026" },
  { id: "INV-2026-00098", date: "May 12, 2026" },
];
