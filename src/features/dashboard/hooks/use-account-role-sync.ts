"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { normalizeLoginResponse } from "@/features/authentication/utils/normalize-login-response";
import { useAccountKey } from "@/lib/account-identity";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";

export function useAccountRoleSync(enabled: boolean) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountKey = useAccountKey();
  const role = useAuthStore((state) => state.role);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = useAuthStore((state) => state.userId);
  const setAuth = useAuthStore((state) => state.setAuth);
  const syncing = useRef(false);
  const profile = useQuery({
    queryKey: ["account", "role", accountKey ?? "unresolved-session"],
    queryFn: settingsService.getProfile,
    enabled: enabled && Boolean(accountKey),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const backendRole = profile.data?.role.toUpperCase();
    const targetRole =
      backendRole === "VENDOR"
        ? "vendor"
        : backendRole === "USER" || backendRole === "BUYER"
          ? "user"
          : null;
    const roleAlreadyCurrent =
      targetRole === role ||
      (targetRole === "user" && (role === "user" || role === "buyer"));
    if (!targetRole || roleAlreadyCurrent || syncing.current) {
      return;
    }

    syncing.current = true;
    authService
      .refresh()
      .then((response) => {
        const refreshed = normalizeLoginResponse(response);
        if (!refreshed.accessToken) {
          throw new Error("The refreshed session has no access token.");
        }
        setAuth({
          accessToken: refreshed.accessToken,
          userId: refreshed.userId ?? currentUserId,
          role: targetRole,
          user: refreshed.user ?? currentUser,
        });
        queryClient.clear();
        if (targetRole === "vendor") {
          toast.success(
            "Your vendor request was approved. Complete identity verification to start listing properties.",
          );
          router.replace("/vendor/kyc-onboarding");
        } else {
          toast.success(
            "Your account is now in User mode. Your vendor records remain preserved.",
          );
          router.replace("/buyer/dashboard");
        }
      })
      .catch(() => {
        syncing.current = false;
        toast.error(
          "Your role change was approved, but the session could not be refreshed. Please sign out and sign in again.",
        );
      });
  }, [
    currentUser,
    currentUserId,
    profile.data?.role,
    queryClient,
    role,
    router,
    setAuth,
  ]);
}
