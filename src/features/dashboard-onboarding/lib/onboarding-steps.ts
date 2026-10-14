import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarCheck2,
  CircleHelp,
  Coins,
  Heart,
  MessageCircleMore,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";

export type DashboardAudience = "user" | "vendor";

export interface DashboardOnboardingStep {
  id: string;
  target: string;
  mobileTarget?: string;
  eyebrow: string;
  title: string;
  description: string;
  tip: string;
  icon: LucideIcon;
}

const userSteps: DashboardOnboardingStep[] = [
  {
    id: "user-welcome",
    target: "nav-dashboard",
    mobileTarget: "mobile-navigation",
    eyebrow: "Welcome aboard",
    title: "Your property journey starts here",
    description:
      "Your dashboard keeps your searches, inspections, messages, and account activity together in one place.",
    tip: "Use the menu to move between each part of your account.",
    icon: CircleHelp,
  },
  {
    id: "user-discover",
    target: "nav-properties",
    mobileTarget: "mobile-navigation",
    eyebrow: "Discover",
    title: "Find the right property faster",
    description:
      "Browse available properties and use search and filters to narrow listings by location, price, and property type.",
    tip: "Open any listing to see its full details, media, and vendor information.",
    icon: Search,
  },
  {
    id: "user-save",
    target: "nav-saved-properties",
    mobileTarget: "mobile-navigation",
    eyebrow: "Shortlist",
    title: "Keep your favourites close",
    description:
      "Save interesting properties while you browse, then compare them later from your Saved Properties page.",
    tip: "Tap the heart on a property card to add or remove it from your shortlist.",
    icon: Heart,
  },
  {
    id: "user-inspections",
    target: "nav-inspections",
    mobileTarget: "mobile-navigation",
    eyebrow: "Take the next step",
    title: "Book and track inspections",
    description:
      "Request an inspection from a listing and follow its status from your dashboard without losing the conversation.",
    tip: "Notifications will keep you informed when an inspection status changes.",
    icon: CalendarCheck2,
  },
  {
    id: "user-support",
    target: "walkthrough-help",
    eyebrow: "You are ready",
    title: "Get help or become a vendor",
    description:
      "Use Messages when you need assistance. If you want to list properties, request a vendor account from Settings.",
    tip: "You can replay this guide anytime from the help icon in the top bar.",
    icon: Store,
  },
];

const vendorSteps: DashboardOnboardingStep[] = [
  {
    id: "vendor-welcome",
    target: "nav-dashboard",
    mobileTarget: "mobile-navigation",
    eyebrow: "Vendor workspace",
    title: "Welcome to your listing command centre",
    description:
      "Manage properties, bookings, inspections, messages, and account activity from one organised workspace.",
    tip: "Your dashboard gives you a quick view of the activity that needs attention.",
    icon: CircleHelp,
  },
  {
    id: "vendor-verification",
    target: "nav-verification",
    mobileTarget: "mobile-navigation",
    eyebrow: "Before you list",
    title: "Complete identity verification",
    description:
      "Submit a valid government-issued ID so the PropertyArk team can verify your vendor account.",
    tip: "You need an approved verification before publishing your first property.",
    icon: ShieldCheck,
  },
  {
    id: "vendor-properties",
    target: "nav-add-property",
    mobileTarget: "mobile-navigation",
    eyebrow: "Build your portfolio",
    title: "Create and manage your listings",
    description:
      "Add complete property details, arrange high-quality media, and keep every listing accurate and up to date.",
    tip: "The first image in your arrangement becomes the property's cover image.",
    icon: Building2,
  },
  {
    id: "vendor-operations",
    target: "nav-shortlet-bookings",
    mobileTarget: "mobile-navigation",
    eyebrow: "Stay organised",
    title: "Track inspections and bookings",
    description:
      "Review inspection requests and shortlet bookings, then respond promptly as their status changes.",
    tip: "Notification indicators highlight new activity across your workspace.",
    icon: CalendarCheck2,
  },
  {
    id: "vendor-credits",
    target: "nav-credit-points",
    mobileTarget: "mobile-navigation",
    eyebrow: "Account tools",
    title: "Manage credits and conversations",
    description:
      "Monitor your available credit points and use Messages whenever you need to speak with a customer or support.",
    tip: "Your current points balance is always visible in the top bar.",
    icon: Coins,
  },
  {
    id: "vendor-support",
    target: "walkthrough-help",
    eyebrow: "You are ready",
    title: "Keep your business moving",
    description:
      "Use the dashboard regularly to keep listings fresh, follow requests, and respond to customers quickly.",
    tip: "You can replay this guide anytime from the help icon in the top bar.",
    icon: MessageCircleMore,
  },
];

export function getDashboardOnboardingSteps(audience: DashboardAudience) {
  return audience === "vendor" ? vendorSteps : userSteps;
}
