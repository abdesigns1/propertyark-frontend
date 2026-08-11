"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { PropertyArkMark } from "@/components/admin/propertyark-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { adminNavigation } from "@/features/admin/data/dashboard-data";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const initials =
    user?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") || "AV";

  return (
    <aside className="flex h-dvh min-h-0 flex-col overflow-hidden bg-primary px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-primary-foreground">
      <PropertyArkMark light className="shrink-0 px-2" />
      <nav className="mt-9 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1 pb-6 [scrollbar-color:rgb(255_255_255_/_0.25)_transparent] [scrollbar-width:thin] lg:gap-0.5 lg:pb-2">
        {adminNavigation.map(({ label, href, icon: Icon }, index) => (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-white/10 hover:text-white lg:py-2",
              index === 0 &&
                "bg-white/90 text-primary hover:bg-white hover:text-primary",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div aria-hidden="true" className="hidden h-16 shrink-0 lg:block" />
      <div className="mt-5 flex shrink-0 items-center gap-3 rounded-xl bg-white/10 p-3 shadow-sm ring-1 ring-white/10 lg:mt-0">
        <Avatar>
          <AvatarFallback className="bg-white text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {user?.fullName || "Ayeni Victor"}
          </p>
          <p className="text-xs capitalize text-primary-foreground/75">
            {role === "staff" ? "Staff" : "Super Admin"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Log out"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={() => {
            clearAuth();
            router.replace("/admin/login");
          }}
        >
          <LogOut />
        </Button>
      </div>
    </aside>
  );
}
