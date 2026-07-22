"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Gauge,
  House,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { DashboardBrand } from "./dashboard-brand";
import { DashboardUserAvatar } from "./dashboard-user-avatar";
import { DashboardMobileNavigation } from "./dashboard-mobile-navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function DashboardTopbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [propertySearch, setPropertySearch] = useState("");
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const role = useAuthStore((state) => state.role);
  const dashboardPath =
    role === "vendor" ? "/vendor/dashboard" : "/buyer/dashboard";
  const propertiesPath =
    role === "vendor" ? "/vendor/dashboard#properties" : "/buyer/properties";
  const settingsPath =
    role === "vendor" ? "/vendor/dashboard#settings" : "/buyer/settings";

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // Local logout must still succeed when the backend session has expired.
    } finally {
      queryClient.clear();
      clearAuth();
      router.replace("/");
    }
  }

  function handlePropertySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = propertySearch.trim();
    if (role === "vendor") {
      router.push(
        query
          ? `/vendor/dashboard?search=${encodeURIComponent(query)}#properties`
          : propertiesPath,
      );
      return;
    }
    router.push(
      query
        ? `${propertiesPath}?search=${encodeURIComponent(query)}`
        : propertiesPath,
    );
  }

  return (
    <header className="sticky top-0 z-40 flex h-[70px] items-center border-b bg-background px-4 shadow-sm md:px-6 lg:ml-64 lg:px-8">
      <div className="flex w-full items-center gap-3">
        <DashboardMobileNavigation />
        <div className="lg:hidden">
          <DashboardBrand />
        </div>
        <form
          onSubmit={handlePropertySearch}
          className="ml-auto hidden w-full max-w-xl sm:block lg:ml-0"
        >
          <InputGroup className="h-10 bg-surface/60">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={propertySearch}
              onChange={(event) => setPropertySearch(event.target.value)}
              placeholder="Search properties, areas..."
              aria-label="Search properties"
            />
          </InputGroup>
        </form>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            asChild
          >
            <Link href={`${settingsPath}?tab=notifications`}>
              <Bell />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Help"
          >
            <CircleHelp />
          </Button>
          <Separator
            orientation="vertical"
            className="mx-2 hidden h-8 sm:block"
          />
          <DashboardUserAvatar />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                aria-label="Open profile menu"
              >
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="min-w-52 p-2"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="py-2">
                  <Link href="/">
                    <House />
                    Go to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2">
                  <Link href={dashboardPath}>
                    <Gauge />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2">
                  <Link href={settingsPath}>
                    <Settings />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="py-2"
                onSelect={handleLogout}
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
