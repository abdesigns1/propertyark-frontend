"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AnimatedDialogIcon } from "@/components/animated-dialog-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AdminActionDialog({
  open,
  onOpenChange,
  icon,
  tone = "primary",
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="flex flex-col items-center gap-5 px-6 pb-6 pt-8 text-center sm:px-8">
          <AnimatedDialogIcon icon={icon} tone={tone} size="large" />
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="max-w-sm text-base leading-7">
              {description}
            </DialogDescription>
          </DialogHeader>
          {children ? <div className="w-full text-left">{children}</div> : null}
        </div>
        <DialogFooter className="grid grid-cols-2 gap-3 border-t bg-muted/30 px-6 pb-7 pt-5 sm:grid-cols-2 sm:px-8">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
