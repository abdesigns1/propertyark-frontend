"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Gauge, Heart, House, Mail, Settings, WalletCards } from "lucide-react";
import { DashboardBrand } from "./dashboard-brand";
import { DashboardUserAvatar } from "./dashboard-user-avatar";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", icon: Gauge, href: "/buyer/dashboard" }, { label: "Properties", icon: House, href: "/buyer/properties" },
  { label: "Saved Properties", icon: Heart, href: "/buyer/saved-properties" }, { label: "Inspection", icon: FileText, href: "#" },
  { label: "Mortgage", icon: FileText, href: "/buyer/mortgage" }, { label: "Investments", icon: WalletCards, href: "/buyer/investments" },
  { label: "Messages", icon: Mail, href: "#" }, { label: "Settings", icon: Settings, href: "/buyer/settings" },
];

export function DashboardNavigation({ closeOnSelect = false }: { closeOnSelect?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard navigation" className="flex flex-col gap-1.5">
      {navigation.map(({ label, icon: Icon, href }) => {
        const active = pathname === href;
        const item = (
          <Link key={label} href={href} aria-current={active ? "page" : undefined} className={cn("flex h-12 items-center gap-4 rounded-xl px-4 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary", active && "bg-primary/10 font-semibold text-primary")}>
            <Icon className="size-5" aria-hidden="true" />{label}
          </Link>
        );
        return closeOnSelect ? <SheetClose key={label} asChild>{item}</SheetClose> : item;
      })}
    </nav>
  );
}

export function DashboardUserSummary() {
  const user = useDashboardUser();
  return (
    <div className="flex items-center gap-3">
      <DashboardUserAvatar />
      <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.fullName}</p><p className="text-sm text-muted-foreground">User</p></div>
    </div>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-surface px-6 py-8 lg:flex">
      <DashboardBrand />
      <div className="mt-12"><DashboardNavigation /></div>
      <div className="mt-auto"><DashboardUserSummary /></div>
    </aside>
  );
}
