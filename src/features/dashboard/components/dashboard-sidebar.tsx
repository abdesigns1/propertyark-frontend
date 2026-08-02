"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent,
  Building2,
  CalendarCheck2,
  FilePlus2,
  FileText,
  Gauge,
  Heart,
  House,
  Landmark,
  Mail,
  MessageSquareText,
  Settings,
  WalletCards,
} from "lucide-react";
import { DashboardBrand } from "./dashboard-brand";
import { DashboardUserAvatar } from "./dashboard-user-avatar";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const buyerNavigation = [
  { label: "Dashboard", icon: Gauge, href: "/buyer/dashboard" },
  { label: "Properties", icon: House, href: "/buyer/properties" },
  { label: "Saved Properties", icon: Heart, href: "/buyer/saved-properties" },
  { label: "Inspection", icon: FileText, href: "/buyer/inspections" },
  { label: "Mortgage", icon: FileText, href: "/buyer/mortgage" },
  { label: "Investments", icon: WalletCards, href: "/buyer/investments" },
  { label: "Messages", icon: Mail, href: "#" },
  { label: "Settings", icon: Settings, href: "/buyer/settings" },
];

const vendorNavigation = [
  { label: "Dashboard", icon: Gauge, href: "/vendor/dashboard" },
  { label: "My Properties", icon: Building2, href: "/vendor/properties" },
  { label: "Saved Properties", icon: Heart, href: "/vendor/saved-properties" },
  { label: "Add Property", icon: FilePlus2, href: "/vendor/properties/new" },
  {
    label: "Short let Bookings",
    icon: CalendarCheck2,
    href: "/vendor/shortlet-bookings",
  },
  { label: "Inspections", icon: FileText, href: "/vendor/inspections" },
  { label: "Mortgage", icon: Landmark, href: "/vendor/mortgage" },

  {
    label: "Subscription & Rewards",
    icon: BadgePercent,
    href: "/vendor/subscription-rewards",
  },
  {
    label: "Messages",
    icon: MessageSquareText,
    href: "/vendor/dashboard#messages",
  },
  { label: "Settings", icon: Settings, href: "/vendor/settings" },
];

export function DashboardNavigation({
  closeOnSelect = false,
}: {
  closeOnSelect?: boolean;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const role = useAuthStore((state) => state.role);
  const navigation = role === "vendor" ? vendorNavigation : buyerNavigation;
  const compactVendorNavigation = role === "vendor" && !closeOnSelect;

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn(
        "flex flex-col gap-1",
        compactVendorNavigation && "gap-2",
      )}
    >
      {navigation.map(({ label, icon: Icon, href }) => {
        const [itemPathname, itemHash = ""] = href.split("#");
        const active =
          pathname === itemPathname &&
          (itemHash ? hash === `#${itemHash}` : !hash);
        const item = (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-12 items-center gap-4 rounded-xl px-4 py-2.5 text-[15px] font-medium leading-6 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary",
              compactVendorNavigation &&
                "min-h-11 flex-none gap-3 px-3 py-2 text-sm leading-5",
              active && "bg-primary/10 font-semibold text-primary",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
        return closeOnSelect ? (
          <SheetClose key={label} asChild>
            {item}
          </SheetClose>
        ) : (
          item
        );
      })}
    </nav>
  );
}

export function DashboardUserSummary() {
  const user = useDashboardUser();
  const role = useAuthStore((state) => state.role);
  const summary = (
    <div className="flex items-center gap-3">
      <DashboardUserAvatar />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.fullName}</p>
        <p className="text-sm text-muted-foreground">
          {role === "vendor" ? "Vendor" : "User"}
        </p>
      </div>
    </div>
  );
  return role === "vendor" ? (
    <Link
      href="/vendor/profile"
      className="block rounded-xl p-1 transition-colors hover:bg-primary/5"
    >
      {summary}
    </Link>
  ) : (
    summary
  );
}

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-hidden bg-surface px-5 py-5 lg:flex">
      <DashboardBrand />
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <DashboardNavigation />
      </div>
      <div className="mt-6 shrink-0">
        <DashboardUserSummary />
      </div>
    </aside>
  );
}
