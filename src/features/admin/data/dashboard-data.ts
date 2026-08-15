import {
  BadgeCheck,
  Bell,
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

export const adminNavigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Properties", href: "/admin/properties", icon: Building2 },
  { label: "KYC Verification", href: "/admin/kyc", icon: BadgeCheck },
  // { label: "Documents Review", href: "#documents", icon: FileCheck2 },
  { label: "Transactions", href: "#transactions", icon: FileText },
  { label: "Escrow Management", href: "#escrow", icon: WalletCards },
  { label: "Subscriptions", href: "#subscriptions", icon: CreditCard },
  { label: "Reports & Analytics", href: "#reports", icon: ChartNoAxesCombined },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "System Settings", href: "#settings", icon: Settings },
] as const;

export const overviewStats = [
  {
    label: "Total Users",
    value: "25,840",
    note: "Registered buyers and vendors",
    change: "+12%",
    icon: Users,
  },
  {
    label: "Active Vendors",
    value: "2,450",
    note: "Verified property providers",
    change: "+5%",
    icon: Building2,
  },
  {
    label: "Total Properties",
    value: "8,920",
    note: "Active property listings",
    change: "New",
    icon: Building2,
  },
  {
    label: "Transaction Vol.",
    value: "₦5.8B",
    note: "Completed property sales",
    change: "+28%",
    icon: WalletCards,
  },
  {
    label: "Pending Reviews",
    value: "124",
    note: "Requires admin attention",
    change: "Urgent",
    icon: ShieldCheck,
  },
] as const;

export const growthData = [
  { day: "Mon", users: 48 },
  { day: "Tue", users: 65 },
  { day: "Wed", users: 100 },
  { day: "Thu", users: 71 },
  { day: "Fri", users: 83 },
  { day: "Sat", users: 112 },
  { day: "Sun", users: 94 },
];

export const properties = [
  {
    name: "Oceanview Penthouse",
    vendor: "Lekki Realty Ltd.",
    location: "Lekki Phase 1, Lagos",
    price: "₦450,000,000",
    status: "Pending",
  },
  {
    name: "Banana Island Villa",
    vendor: "Signature Estates",
    location: "Banana Island, Ikoyi",
    price: "₦1,200,000,000",
    status: "Active",
  },
  {
    name: "Eko Atlantic Suite",
    vendor: "Prime Estates Ltd",
    location: "Eko Atlantic, Lagos",
    price: "₦320,000,000",
    status: "Active",
  },
  {
    name: "Maitama Residence",
    vendor: "Crown Properties",
    location: "Maitama, Abuja",
    price: "₦680,000,000",
    status: "Active",
  },
];

export const users = [
  {
    name: "Olumide Ajayi",
    email: "olumide.a@domain.com",
    role: "User",
    status: "Verified",
    joined: "Oct 12, 2023",
  },
  {
    name: "Blessing Eze",
    email: "b.eze@realty.ng",
    role: "Vendor",
    status: "In Review",
    joined: "Oct 14, 2023",
  },
  {
    name: "Yemi Adekola",
    email: "yemi.a@propertyark.com",
    role: "Admin",
    status: "Verified",
    joined: "Oct 18, 2023",
  },
  {
    name: "Tomi Martins",
    email: "tomi@martinsrealty.ng",
    role: "Vendor",
    status: "In Review",
    joined: "Oct 20, 2023",
  },
];

export const recentActivities = [
  {
    initials: "CU",
    title: "Chioma Uzo submitted a listing",
    meta: "2 minutes ago • Ikeja, Lagos",
  },
  {
    initials: "EO",
    title: "KYC approved for Emeka Okoro",
    meta: "15 minutes ago • System automated",
  },
  {
    initials: "DH",
    title: "Vendor application from Deluxe Homes",
    meta: "1 hour ago • Awaiting review",
  },
];

export const verificationQueue = [
  { icon: Users, name: "Yemi Adekola" },
  { icon: Building2, name: "Prime Estates Ltd" },
] as const;

export { MessageSquareText };
