"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MAIN_NAV_LINKS,
  PROFESSIONALS_LINKS,
  CONTACT_LINK,
} from "@/constants/navigation";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { getDashboardPath } from "@/features/authentication/utils/dashboard-route";
import { DashboardUserAvatar } from "@/features/dashboard/components/dashboard-user-avatar";
import { useDashboardUser } from "@/features/dashboard/hooks/use-dashboard-user";

interface NavbarProps {
  reserveSpace?: boolean;
}

function MainNavLink({ link, mobile = false, onNavigate }: { link: { label: string; href: string }; mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [linkPath, query = ""] = link.href.split("?");
  const linkPurpose = new URLSearchParams(query).get("purpose");
  const currentPurpose = searchParams.get("purpose") ?? searchParams.get("type");
  const isActive =
    pathname === linkPath &&
    (linkPurpose
      ? currentPurpose === linkPurpose
      : linkPath === "/properties"
        ? !currentPurpose
        : true);

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={cn(
        "text-sm font-medium transition-colors",
        mobile && "rounded-lg px-3 py-2",
        isActive
          ? mobile
            ? "bg-primary/10 text-primary"
            : "border-b-2 border-primary pb-0.5 text-primary"
          : mobile
            ? "text-muted-foreground hover:bg-accent hover:text-foreground"
            : "text-navbar-foreground/80 hover:text-navbar-foreground",
      )}
    >
      {link.label}
    </Link>
  );
}

export function Navbar({ reserveSpace = false }: NavbarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [professionalsOpen, setProfessionalsOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useDashboardUser();
  const dashboardPath = getDashboardPath(role);

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // A stale or expired backend session should not prevent local logout.
    } finally {
      queryClient.clear();
      clearAuth();
      setMobileOpen(false);
      router.replace("/");
    }
  }

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-40 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-white/15 bg-navbar/90 px-6 py-2.5 text-navbar-foreground shadow-lg backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-navbar/75 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/property%20arc%20logo-12.png"
              alt="PropertyArk logo"
              width={100}
              height={20}
              className="h-9 w-auto object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          {/* Links */}
          <div className="hidden items-center gap-6 lg:flex">
            {MAIN_NAV_LINKS.map((link) => (
              <Suspense key={link.href} fallback={<Link href={link.href} className="text-sm font-medium text-navbar-foreground/80">{link.label}</Link>}>
                <MainNavLink link={link} />
              </Suspense>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground focus-visible:outline-none">
                  Professionals
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {PROFESSIONALS_LINKS.map((link) => (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href={CONTACT_LINK.href}
              className="text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground"
            >
              {CONTACT_LINK.label}
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-navbar-foreground hover:bg-white/10 hover:text-navbar-foreground lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            {/* The sheet uses its own solid surface and semantic text colors. */}
            <SheetContent side="right" className="lg:hidden">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-4">
                <nav className="flex flex-col gap-3">
                  {MAIN_NAV_LINKS.map((link) => (
                    <Suspense key={link.href} fallback={<Link href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">{link.label}</Link>}>
                      <MainNavLink link={link} mobile onNavigate={() => setMobileOpen(false)} />
                    </Suspense>
                  ))}

                  <Collapsible
                    open={professionalsOpen}
                    onOpenChange={setProfessionalsOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-expanded={professionalsOpen}
                      >
                        Professionals
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            professionalsOpen && "rotate-180",
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <div className="flex flex-col gap-1 py-1 pl-3">
                        {PROFESSIONALS_LINKS.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Link
                    href={CONTACT_LINK.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {CONTACT_LINK.label}
                  </Link>
                </nav>
              </div>
              <SheetFooter className="flex flex-col gap-3 px-4 pb-4 pt-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-1">
                      <DashboardUserAvatar />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.firstName}
                        </span>
                        <span className="text-xs capitalize text-muted-foreground">
                          {role ?? "user"}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link
                        href={dashboardPath}
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard data-icon="inline-start" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => void handleLogout()}
                    >
                      <LogOut data-icon="inline-start" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Login
                    </Link>
                    <Button
                      asChild
                      className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary-hover"
                    >
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                      >
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Right actions (desktop only) */}
          <div className="hidden items-center gap-4 lg:flex">
            {isAuthenticated ? (
              <ProfileMenu
                firstName={user.firstName}
                dashboardPath={dashboardPath}
                onLogout={handleLogout}
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground"
                >
                  Login
                </Link>
                <Button
                  asChild
                  className="rounded-full bg-secondary p-5 text-secondary-foreground hover:bg-secondary-hover"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
      {reserveSpace && <div aria-hidden="true" className="h-20" />}
    </>
  );
}

function ProfileMenu({
  firstName,
  dashboardPath,
  onLogout,
}: {
  firstName: string;
  dashboardPath: string;
  onLogout: () => Promise<void>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-navbar-foreground outline-none ring-offset-transparent transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <DashboardUserAvatar />
          <span className="max-w-28 truncate text-sm font-medium">
            {firstName}
          </span>
          <ChevronDown className="size-4 text-current opacity-75" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Signed in as {firstName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={dashboardPath}>
              <LayoutDashboard />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => void onLogout()}
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
