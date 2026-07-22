import { FileText, Heart, MessageSquare, WalletCards } from "lucide-react";
import type {
  DashboardActivity,
  DashboardStat,
} from "@/features/dashboard/types";

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    label: "Saved properties",
    value: "0",
    note: "Your saved listings",
    icon: Heart,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    label: "Active inquiries",
    value: "0",
    note: "Open inquiries",
    icon: MessageSquare,
    iconClass: "bg-secondary/15 text-secondary-hover",
  },
  {
    label: "Purchases",
    value: "0",
    note: "No data available",
    icon: WalletCards,
    iconClass: "bg-surface text-muted-foreground",
  },
  {
    label: "Mortgage request",
    value: "0",
    note: "No data available",
    icon: FileText,
    iconClass: "bg-primary/10 text-primary",
  },
];

export const DASHBOARD_ACTIVITIES: DashboardActivity[] = [
  {
    title: "Booked an Inspection",
    time: "2 hours ago",
    text: "You booked an inspection with Oladele Omotayo. Confirmation is on the way.",
    color: "bg-primary",
  },
  {
    title: "Escrow account funded",
    time: "Yesterday at 4:12 PM",
    text: "You successfully funded your escrow account with the sum of ₦1,000,000.",
    color: "bg-secondary",
  },
  {
    title: "Successful Purchase",
    time: "Feb 14, 2024",
    text: "You successfully purchased a property from De Light Properties.",
    color: "bg-muted-foreground",
  },
];
