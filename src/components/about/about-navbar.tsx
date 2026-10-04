"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  CONTACT_LINK,
  MAIN_NAV_LINKS,
  PROFESSIONALS_LINKS,
} from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function AboutNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [professionalsOpen, setProfessionalsOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="relative bg-navbar text-navbar-foreground">
      <nav
        aria-label="About page navigation"
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"
      >
        <Link href="/" aria-label="PropertyArk home">
          <Image
            src="/PropertyArk%20Logo%20Light.png"
            alt="PropertyArk"
            width={132}
            height={28}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Professionals
                <ChevronDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52">
              <DropdownMenuGroup>
                {PROFESSIONALS_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href={CONTACT_LINK.href}
            className="text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground"
          >
            {CONTACT_LINK.label}
          </Link>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-navbar-foreground/80 transition-colors hover:text-navbar-foreground"
          >
            Login
          </Link>
          <Button asChild variant="secondary" size="lg" className="rounded-xl">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-navbar-foreground hover:bg-white/10 hover:text-navbar-foreground lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="lg:hidden">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-2 px-4">
              {MAIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <Collapsible
                open={professionalsOpen}
                onOpenChange={setProfessionalsOpen}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Professionals
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        professionalsOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-1 py-1 pl-3">
                    {PROFESSIONALS_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Link
                href={CONTACT_LINK.href}
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {CONTACT_LINK.label}
              </Link>
            </nav>

            <SheetFooter className="gap-2 px-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={closeMobileMenu}>
                  Login
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/register" onClick={closeMobileMenu}>
                  Get Started
                </Link>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
