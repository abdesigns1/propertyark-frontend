"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Store, UserRound } from "lucide-react";
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
import { normalizeLoginResponse } from "@/features/authentication/utils/normalize-login-response";
import type { RoleChangeTarget } from "@/features/account-role-request/lib/role-change-request";
import { getApiErrorMessage } from "@/services/api-error";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import { useAuthStore, type Role } from "@/store/auth.store";

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
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = useAuthStore((state) => state.userId);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const content = roleRequestContent[targetRole];
  const Icon = content.Icon;

  const switchRole = useMutation({
    mutationFn: async () => {
      const response = await settingsService.switchRole(targetRole);
      const switched = normalizeLoginResponse(response);
      if (switched.accessToken) return switched;

      const refreshed = normalizeLoginResponse(await authService.refresh());
      if (!refreshed.accessToken) {
        throw new Error(
          "Your role changed, but the refreshed session did not include an access token. Please sign in again.",
        );
      }
      return refreshed;
    },
    onSuccess: async (session) => {
      const role = targetRole.toLowerCase() as Role;
      setAuth({
        accessToken: session.accessToken,
        userId: session.userId ?? currentUserId,
        role,
        user: session.user ?? currentUser,
      });
      setDialogOpen(false);
      queryClient.clear();
      toast.success(content.switched);

      let destination = "/buyer/dashboard";
      if (targetRole === "VENDOR") {
        const profile = await settingsService.getProfile().catch(() => null);
        destination =
          profile?.identityVerificationStatus.toUpperCase() === "VERIFIED"
            ? "/vendor/dashboard"
            : "/vendor/kyc-onboarding";
      }

      router.replace(destination);
      router.refresh();
    },
    onError: (error) => {
      setDialogOpen(false);
      toast.error(
        getApiErrorMessage(error, "Your account mode could not be changed."),
      );
    },
  });

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
    </Card>
  );
}
