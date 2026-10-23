"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CircleCheck,
  LogOut,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { RoleChangeTarget } from "@/features/account-role-request/lib/role-change-request";
import { getApiErrorMessage } from "@/services/api-error";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";

const roleRequestContent = {
  VENDOR: {
    anchor: "become-vendor",
    title: "Become a vendor",
    description:
      "Switch directly to your vendor workspace without submitting an administrator request.",
    detail:
      "You must complete identity verification before you can publish a property on PropertyArk.",
    dialogTitle: "Switch to Vendor mode?",
    dialogDescription:
      "Your account will switch immediately to Vendor mode. If your identity is not verified, you will be taken to verification before you can publish a property.",
    action: "Switch to vendor",
    confirmAction: "Switch to vendor",
    switching: "Switching…",
    switched: "You are now using your Vendor workspace.",
    Icon: Store,
  },
  USER: {
    anchor: "switch-to-user",
    title: "Switch back to user",
    description:
      "Return to the standard PropertyArk user experience without waiting for another administrator approval.",
    detail:
      "Your vendor properties, verification details, transactions, and other records will remain stored. Vendor-only tools will be unavailable while your role is User.",
    dialogTitle: "Switch back to User mode?",
    dialogDescription:
      "You will move to your user dashboard immediately. Your vendor properties, verification details, transactions, and other records will remain preserved.",
    action: "Switch back to user",
    confirmAction: "Switch to user",
    switching: "Switching…",
    switched: "You are now using your User workspace.",
    Icon: UserRound,
  },
} satisfies Record<RoleChangeTarget, Record<string, string | typeof Store>>;

export function RoleChangeRequestCard({
  targetRole,
}: {
  targetRole: RoleChangeTarget;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const content = roleRequestContent[targetRole];
  const Icon = content.Icon;

  const switchRole = useMutation({
    mutationFn: () => settingsService.switchRole(targetRole),
    onSuccess: () => {
      setDialogOpen(false);
      setSuccessDialogOpen(true);
    },
    onError: (error) => {
      setDialogOpen(false);
      toast.error(
        getApiErrorMessage(error, "Your account mode could not be changed."),
      );
    },
  });

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await authService.logout();
    } catch {
      // Clear the local session even if the backend session is already stale.
    } finally {
      queryClient.clear();
      clearAuth();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Card id={content.anchor} className="scroll-mt-24 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon className="text-primary" /> {content.title}
        </CardTitle>
        <CardDescription className="max-w-2xl leading-6">
          {content.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 shrink-0 text-primary" />
          {content.detail}
        </p>
      </CardContent>
      <CardFooter>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={switchRole.isPending}>
              <Icon data-icon="inline-start" />
              {content.action}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{content.dialogTitle}</DialogTitle>
              <DialogDescription>{content.dialogDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={switchRole.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={() => switchRole.mutate()}
                disabled={switchRole.isPending}
              >
                {switchRole.isPending && <Spinner data-icon="inline-start" />}
                {switchRole.isPending
                  ? content.switching
                  : content.confirmAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>

      <Dialog open={successDialogOpen}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CircleCheck className="size-6" aria-hidden="true" />
            </div>
            <DialogTitle>Role switched successfully</DialogTitle>
            <DialogDescription className="leading-6">
              {content.switched} Log out and sign in again to refresh your
              session and open the correct dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => void handleLogout()}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LogOut data-icon="inline-start" />
              )}
              {loggingOut ? "Logging out…" : "Log out and sign in again"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
