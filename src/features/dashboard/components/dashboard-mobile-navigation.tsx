"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardBrand } from "./dashboard-brand";
import { DashboardNavigation, DashboardUserSummary } from "./dashboard-sidebar";

export function DashboardMobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(20rem,85vw)] gap-0 overflow-y-auto bg-surface p-0 sm:max-w-xs"
      >
        <SheetHeader className="border-b px-6 py-6">
          <DashboardBrand />
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
          <DashboardNavigation closeOnSelect />
          <div className="mt-auto border-t pt-6">
            <DashboardUserSummary />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
