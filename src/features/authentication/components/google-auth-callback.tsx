"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardPath } from "@/features/authentication/utils/dashboard-route";
import {
  GOOGLE_AUTH_REDIRECT_KEY,
  GOOGLE_AUTH_ROLE_KEY,
  GOOGLE_AUTH_VENDOR_KYC_KEY,
} from "@/features/authentication/utils/google-auth";
import { normalizeLoginResponse } from "@/features/authentication/utils/normalize-login-response";
import type { LoginResponse } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api-error";
import { settingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";
import { markVendorWelcomeBonusPending } from "@/features/authentication/utils/vendor-welcome-bonus";

function parseGoogleUser(value: string) {
  try {
    return JSON.parse(value) as LoginResponse["user"];
  } catch {
    return JSON.parse(decodeURIComponent(value)) as LoginResponse["user"];
  }
}

export function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token") ?? searchParams.get("accessToken");
    const serializedUser = searchParams.get("user");
    const backendError =
      searchParams.get("error") ?? searchParams.get("message");

    if (backendError || !token || !serializedUser) {
      toast.error(
        backendError || "Google authentication could not be completed.",
      );
      router.replace("/login");
      return;
    }

    async function completeGoogleAuthentication(
      googleToken: string,
      googleUser: string,
    ) {
      try {
        const auth = normalizeLoginResponse({
          accessToken: googleToken,
          user: parseGoogleUser(googleUser),
        });
        if (!auth.accessToken || !auth.user) {
          throw new Error("The Google authentication response is incomplete.");
        }

        queryClient.clear();
        setAuth(auth);

        const requestedRole =
          window.sessionStorage.getItem(GOOGLE_AUTH_ROLE_KEY);
        const requiresVendorKyc =
          window.sessionStorage.getItem(GOOGLE_AUTH_VENDOR_KYC_KEY) === "1";
        const requestedRedirect = window.sessionStorage.getItem(
          GOOGLE_AUTH_REDIRECT_KEY,
        );
        window.sessionStorage.removeItem(GOOGLE_AUTH_REDIRECT_KEY);
        window.sessionStorage.removeItem(GOOGLE_AUTH_ROLE_KEY);
        window.sessionStorage.removeItem(GOOGLE_AUTH_VENDOR_KYC_KEY);

        const roleMismatch =
          requestedRole === "VENDOR" && auth.role !== "vendor";
        if (roleMismatch) {
          // Google returns the requested account type in the OAuth `state`
          // parameter. Older API deployments created the account as USER even
          // when this registration flow requested VENDOR. Recover by using the
          // same role-switch endpoint available in account settings so the
          // registrant does not end up in the buyer dashboard.
          await settingsService.switchRole("VENDOR");
          queryClient.clear();
          setAuth({
            ...auth,
            role: "vendor",
          });

          if (auth.user.email) {
            markVendorWelcomeBonusPending(auth.user.email);
          }

          toast.success(
            "Your vendor account is ready. Complete identity verification to start listing properties.",
          );
          router.replace("/vendor/kyc-onboarding");
          return;
        }
        const destination =
          requiresVendorKyc && auth.role === "vendor"
            ? "/vendor/kyc-onboarding"
            : requestedRedirect?.startsWith("/") &&
                !requestedRedirect.startsWith("//")
              ? requestedRedirect
              : getDashboardPath(auth.role);

        if (
          requestedRole === "VENDOR" &&
          auth.role === "vendor" &&
          auth.user.email
        ) {
          markVendorWelcomeBonusPending(auth.user.email);
        }

        toast.success("Signed in with Google successfully.");
        router.replace(destination);
      } catch (error) {
        clearAuth();
        window.sessionStorage.removeItem(GOOGLE_AUTH_REDIRECT_KEY);
        window.sessionStorage.removeItem(GOOGLE_AUTH_ROLE_KEY);
        window.sessionStorage.removeItem(GOOGLE_AUTH_VENDOR_KYC_KEY);
        toast.error(
          getApiErrorMessage(
            error,
            "The Google authentication response could not be verified.",
          ),
        );
        router.replace("/login");
      }
    }

    void completeGoogleAuthentication(token, serializedUser);
  }, [clearAuth, queryClient, router, searchParams, setAuth]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <LoaderCircle className="size-8 animate-spin text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Completing sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Please wait while we securely connect your Google account.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
